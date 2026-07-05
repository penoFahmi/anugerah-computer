<?php

namespace App\Jobs;

use App\Models\ChatLog;
use App\Models\ServiceOrder;
use App\Enums\ServiceStatus;
use App\Services\WaGateway;
use App\Ai\Agents\CustomerService;
use App\Ai\Agents\IntentAnalyzer; // Aktifkan kembali Intent Analyzer LLM
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class ProcessInboundWaMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public ChatLog $chatLog,
        public ?ServiceOrder $serviceOrder,
        public string $rawPhone
    ) {}

    private function getChatHistory(): array
    {
        $logs = ChatLog::where('phone', $this->rawPhone)
            ->where('id', '<', $this->chatLog->id)
            ->latest()
            ->take(6)
            ->get()
            ->reverse();

        $history = [];
        foreach ($logs as $log) {
            $history[] = [
                'role' => $log->direction === 'inbound' ? 'user' : 'assistant',
                'content' => $log->message
            ];
        }
        return $history;
    }

    public function handle(): void
    {
        $originalMessage = $this->chatLog->message;

        // ==========================================
        // TAHAP 1: PANGGIL NLP PYTHON LOKAL
        // ==========================================
        $nlpIntent = 'umum_teknis';
        $nlpConfidence = 0.0;
        $isSvmSuccessful = 0;

        try {
            $response = Http::timeout(5)->post('http://127.0.0.1:8001/api/predict-intent', [
                'text' => $originalMessage
            ]);

            if ($response->successful()) {
                $nlpData = $response->json();
                $nlpIntent = $nlpData['intent'] ?? 'umum_teknis';
                $nlpConfidence = $nlpData['confidence'] ?? 0.0;
                $isSvmSuccessful = 1;
            }
        } catch (\Exception $e) {
            Log::error("Koneksi ke NLP Python gagal: " . $e->getMessage());
        }

        // SIMPAN HASIL RAW NLP KE DATABASE (Agar kolom tidak NULL lagi)
        $this->chatLog->update([
            'svm_predicted_intent' => $nlpIntent,
            'svm_confidence_score' => $nlpConfidence,
            'is_svm_successful' => $isSvmSuccessful,
        ]);

        // ==========================================
        // TAHAP 2: EVALUASI JALUR CEPAT (NLP JALUR UTAMA)
        // ==========================================
        if ($this->serviceOrder && in_array($nlpIntent, ['setuju', 'batal']) && $nlpConfidence >= 0.75) {
            
            if ($this->serviceOrder->status->value !== ServiceStatus::WAITING_APPROVAL->value) {
                $this->triggerHumanHandoff("Unit sudah diproses lanjutan.");
                return;
            }

            if ($nlpIntent === 'setuju') {
                $this->serviceOrder->update(['status' => ServiceStatus::APPROVED]);
                $balasan = "Baik Kak, konfirmasi *SETUJU* diterima melalui NLP Lokal. Unit *{$this->serviceOrder->device->brand}* segera diproses. 🛠️";
            } else {
                $this->serviceOrder->update(['status' => ServiceStatus::CANCELLED]);
                $balasan = "Baik Kak, konfirmasi *BATAL* diterima melalui NLP Lokal. Unit *{$this->serviceOrder->device->brand}* kami batalkan. 🙏";
            }

            $this->chatLog->update([
                'resolved_by' => 'agent_nlp_fasttext',
                'final_intent' => $nlpIntent
            ]);

            WaGateway::sendMessage($this->rawPhone, $balasan, $this->serviceOrder->id, 'nlp_direct_reply');
            return; 
        }

        // ==========================================
        // TAHAP 3: MEKANISME FALLBACK KE LLM INTENT ANALYZER
        // ==========================================
        // Jika NLP ragu-ragu (seperti nilai 0.26 tadi), LLM akan menganalisis niatnya secara mendalam
        $this->chatLog->update(['is_llm_triggered' => 1]);

        try {
            $intentAgent = new IntentAnalyzer();
            $analysis = $intentAgent->prompt($originalMessage);
            $analysisData = is_array($analysis) ? $analysis : (array) $analysis;

            $llmIntent = $analysisData['intent'] ?? 'unclear';
            $reasoning = $analysisData['reasoning'] ?? 'Sebab dianalisis LLM Fallback';

            // Jika LLM Fallback berhasil mendeteksi persetujuan/pembatalan
            if ($this->serviceOrder && ($llmIntent === 'approve' || $llmIntent === 'cancel')) {
                
                if ($this->serviceOrder->status->value !== ServiceStatus::WAITING_APPROVAL->value) {
                    $this->triggerHumanHandoff("Unit sudah diproses lanjutan (LLM Guardrail).");
                    return;
                }

                if ($llmIntent === 'approve') {
                    $this->serviceOrder->update(['status' => ServiceStatus::APPROVED]);
                    $balasan = "Terima kasih atas konfirmasinya. Perbaikan unit *{$this->serviceOrder->device->brand}* segera kami proses oleh teknisi. 🛠️";
                    $finalIntentName = 'setuju';
                } else {
                    $this->serviceOrder->update(['status' => ServiceStatus::CANCELLED]);
                    $balasan = "Baik Kak, permintaan pembatalan kami terima. Perbaikan unit *{$this->serviceOrder->device->brand}* telah dibatalkan. 🙏";
                    $finalIntentName = 'batal';
                }

                $this->chatLog->update([
                    'resolved_by' => 'agent_intent_analyzer_fallback',
                    'final_intent' => $finalIntentName,
                    'llm_raw_response' => ['reasoning' => $reasoning]
                ]);

                WaGateway::sendMessage($this->rawPhone, $balasan, $this->serviceOrder->id, 'llm_intent_fallback_reply');
                return;
            }

            // ==========================================
            // TAHAP 4: CHAT GENERATIF (JIKA BUKAN BERISI NIAT SETUJU/BATAL)
            // ==========================================
            $history = $this->getChatHistory();
            $csAgent = new CustomerService($history);
            
            if ($this->serviceOrder) {
                $contextPrompt = "Info Sistem: Pelanggan tanya tentang nota " . $this->serviceOrder->order_number . " (Unit: " . $this->serviceOrder->device->brand . "). Status: " . $this->serviceOrder->status->value . ". Biaya: " . $this->serviceOrder->estimated_cost . ". Balas ramah pesan ini: '{$originalMessage}'";
                $this->serviceOrder->update(['last_customer_message' => $originalMessage]);
            } else {
                $contextPrompt = "Balas pertanyaan umum pelanggan dengan ramah: '{$originalMessage}'";
            }

            $aiResponse = (string) $csAgent->prompt($contextPrompt);
            
            $this->chatLog->update([
                'resolved_by' => 'agent_llm_customer_service',
                'final_intent' => 'umum_teknis',
                'llm_raw_response' => ['text' => $aiResponse, 'reasoning' => $reasoning] 
            ]);

            WaGateway::sendMessage($this->rawPhone, $aiResponse, $this->serviceOrder?->id, 'llm_cs_reply');

        } catch (\Throwable $e) {
            Log::error('Mekanisme Fallback LLM Mengalami Kegagalan: ' . $e->getMessage());
            $this->triggerHumanHandoff("Sistem Mengalami Kegagalan.");
        }
    }

    /**
     * Fungsi pembantu untuk mengaktifkan Intervensi Manual (Human Handoff)
     */
    private function triggerHumanHandoff(string $alasan): void
    {
        $balasan = "Maaf Kak, pesan Anda akan segera ditangani langsung oleh Admin toko kami. Mohon tunggu sebentar ya. 🙏";
        WaGateway::sendMessage($this->rawPhone, $balasan, $this->serviceOrder?->id, 'human_handoff_trigger');
        
        $this->chatLog->update([
            'resolved_by' => 'human', 
            'final_intent' => 'needs_manual_override',
            'llm_raw_response' => ['error' => $alasan]
        ]);
    }
}