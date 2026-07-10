<?php

namespace App\Jobs;

use App\Models\ChatLog;
use App\Models\ServiceOrder;
use App\Enums\ServiceStatus;
use App\Services\WaGateway;
use App\Ai\Agents\CustomerService;
use App\Ai\Agents\IntentAnalyzer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Events\ServiceOrderBroadcast;

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

    /**
     * Algoritma Estimasi Token untuk Skripsi (1 Kata = 1.5 Token)
     */
    private function estimateTokens(string $text): int
    {
        return (int) ceil(str_word_count($text) * 1.5);
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

        // Simpan Hasil NLP Lapis Pertama (Token LLM Masih 0 karena belum pakai AI Groq)
        $this->chatLog->update([
            'svm_predicted_intent' => $nlpIntent,
            'svm_confidence_score' => $nlpConfidence,
            'is_svm_successful' => $isSvmSuccessful,
            'llm_prompt_tokens' => 0, 
            'llm_completion_tokens' => 0,
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
                event(new ServiceOrderBroadcast($this->serviceOrder, 'updated'));
                $balasan = "Baik Kak, konfirmasi *SETUJU* diterima. Unit *{$this->serviceOrder->device->brand}* segera diproses teknisi. 🛠️";
        
                } else {
                $this->serviceOrder->update(['status' => ServiceStatus::CANCELLED]);
                event(new ServiceOrderBroadcast($this->serviceOrder, 'updated'));
                $balasan = "Baik Kak, konfirmasi *BATAL* diterima. Layanan unit *{$this->serviceOrder->device->brand}* kami batalkan. 🙏";
            
                

                }

            $this->chatLog->update([
                'resolved_by' => 'agent_nlp_fasttext',
                'final_intent' => $nlpIntent,
            ]);

            WaGateway::sendMessage($this->rawPhone, $balasan, $this->serviceOrder->id, 'nlp_direct_reply');
            return; 
        }

        // ==========================================
        // TAHAP 3: MEKANISME FALLBACK KE LLM INTENT ANALYZER
        // ==========================================
        $this->chatLog->update(['is_llm_triggered' => 1]);

        try {
            $intentAgent = new IntentAnalyzer();
            $analysis = $intentAgent->prompt($originalMessage);
            $analysisData = is_array($analysis) ? $analysis : (array) $analysis;

            $llmIntent = $analysisData['intent'] ?? 'unclear';
            $reasoning = $analysisData['reasoning'] ?? 'Dianalisis oleh Fallback LLM';

            // Hitung Token untuk Intent Analyzer
            $promptTokens = $this->estimateTokens((string)$intentAgent->instructions() . " " . $originalMessage);
            $completionTokens = $this->estimateTokens(json_encode($analysisData));

            if ($this->serviceOrder && ($llmIntent === 'approve' || $llmIntent === 'cancel')) {
                
                if ($this->serviceOrder->status->value !== ServiceStatus::WAITING_APPROVAL->value) {
                    $this->triggerHumanHandoff("Sistem Guardrail Mencegah AI.");
                    return;
                }

                if ($llmIntent === 'approve') {
                    $this->serviceOrder->update(['status' => ServiceStatus::APPROVED]);
                    event(new ServiceOrderBroadcast($this->serviceOrder, 'updated'));
                    $balasan = "Terima kasih atas konfirmasinya. Perbaikan unit *{$this->serviceOrder->device->brand}* segera kami proses. 🛠️";
                    
                    $finalIntentName = 'setuju';
                } else {
                    $this->serviceOrder->update(['status' => ServiceStatus::CANCELLED]);
                    event(new ServiceOrderBroadcast($this->serviceOrder, 'updated'));
                    $balasan = "Baik Kak, permintaan pembatalan kami terima. Perbaikan unit *{$this->serviceOrder->device->brand}* telah dibatalkan. 🙏";
                    
                    $finalIntentName = 'batal';
                }

                $this->chatLog->update([
                    'resolved_by' => 'agent_intent_analyzer_fallback',
                    'final_intent' => $finalIntentName,
                    'llm_raw_response' => ['reasoning' => $reasoning],
                    'llm_prompt_tokens' => $promptTokens,
                    'llm_completion_tokens' => $completionTokens,
                ]);

                WaGateway::sendMessage($this->rawPhone, $balasan, $this->serviceOrder->id, 'llm_intent_fallback_reply');
                return;
            }

            // ==========================================
            // TAHAP 4: CHAT GENERATIF (JIKA BUKAN NIAT SETUJU/BATAL)
            // ==========================================
            $history = $this->getChatHistory();
            $csAgent = new CustomerService($history);
            
            if ($this->serviceOrder) {
                // Eager Load data garansi agar tidak error
                $this->serviceOrder->load('warranty');
                
                // Siapkan teks garansi untuk disuapkan ke AI
                $warrantyStatus = 'Tidak Ada Garansi';
                if ($this->serviceOrder->warranty) {
                    $wStatus = strtoupper($this->serviceOrder->warranty->status);
                    $wEndDate = \Carbon\Carbon::parse($this->serviceOrder->warranty->end_date)->format('d M Y');
                    $warrantyStatus = "{$wStatus} (Berlaku s/d: {$wEndDate})";
                }

                // INJEKSI DATA PENUH: Beri tahu AI bahwa data sudah lengkap, JANGAN PAKAI ALAT.
                $contextPrompt = "[DATA SISTEM TERDETEKSI]\n" .
                    "Pelanggan ini menggunakan nomor HP yang terdaftar pada sistem kami.\n" .
                    "- Nota: {$this->serviceOrder->order_number}\n" .
                    "- Unit: {$this->serviceOrder->device->brand} {$this->serviceOrder->device->model}\n" .
                    "- Status: {$this->serviceOrder->status->label()}\n" .
                    "- Biaya: Rp " . number_format((float) $this->serviceOrder->estimated_cost, 0, ',', '.') . "\n" .
                    "- Garansi: {$warrantyStatus}\n\n" .
                    "INSTRUKSI KHUSUS UNTUK ANDA: Gunakan data di atas untuk menjawab. ANDA DILARANG KERAS menanyakan nomor nota atau memanggil Tool CheckServiceStatus karena semua data sudah saya sediakan di sini!\n\n" .
                    "Pesan Pelanggan: '{$originalMessage}'";
                
                $this->serviceOrder->update(['last_customer_message' => $originalMessage]);
            } else {
                // JIKA NOMOR BARU / TIDAK ADA SERVIS AKTIF
                $contextPrompt = "[TIDAK ADA DATA SISTEM]\n" .
                    "Ini adalah pelanggan baru atau tidak ada servis aktif. Jawab dengan ramah. Jika dia bertanya tentang servisannya, barulah minta nomor notanya.\n\n" .
                    "Pesan Pelanggan: '{$originalMessage}'";
            }

            $aiResponse = (string) $csAgent->prompt($contextPrompt);
            
            // Hitung Token untuk Customer Service Generatif
            $csPromptTokens = $this->estimateTokens((string)$csAgent->instructions() . " " . $contextPrompt . " " . json_encode($history));
            $csCompletionTokens = $this->estimateTokens($aiResponse);

            $this->chatLog->update([
                'resolved_by' => 'agent_llm_customer_service',
                'final_intent' => 'umum_teknis',
                'llm_raw_response' => ['text' => $aiResponse, 'reasoning' => $reasoning],
                'llm_prompt_tokens' => $promptTokens + $csPromptTokens, 
                'llm_completion_tokens' => $completionTokens + $csCompletionTokens,
            ]);

            WaGateway::sendMessage($this->rawPhone, $aiResponse, $this->serviceOrder?->id, 'llm_cs_reply');

        } catch (\Throwable $e) {
            Log::error('Fallback LLM Error: ' . $e->getMessage());
            $this->triggerHumanHandoff("Sistem AI Mengalami Kegagalan.");
        }
    }

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