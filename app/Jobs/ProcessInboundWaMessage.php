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

class ProcessInboundWaMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public ChatLog $chatLog,
        public ?ServiceOrder $serviceOrder,
        public string $rawPhone
    ) {}

    /**
     * MENGAMBIL INGATAN MASA LALU (MEMORY)
     * Mengambil 6 chat terakhir dari pelanggan ini agar AI paham konteks
     */
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
        // KONDISI 1: PESAN CS UMUM (TANPA TIKET / TIKET SUDAH SELESAI)
        // ==========================================
        if (!$this->serviceOrder) {
            try {
                // Berikan ingatan masa lalu ke Agen CS
                $history = $this->getChatHistory();
                
                $agent = new CustomerService($history);
                $aiResponse = (string) $agent->prompt($originalMessage);

                $this->chatLog->update([
                    'resolved_by' => 'agent_customer_service',
                    // Disimpan sebagai JSON array karena field di DB adalah JSON
                    'llm_raw_response' => json_encode(['text' => $aiResponse]), 
                    'final_intent' => 'general_cs'
                ]);

                // Kirim balasan ke WA
                WaGateway::sendMessage($this->rawPhone, $aiResponse, null, 'general_cs_reply');
                
            } catch (\Throwable $e) {
                Log::error('Job CS AI Error: ' . $e->getMessage());
                $this->chatLog->update(['resolved_by' => 'human', 'final_intent' => 'unclear']);
            }
            return;
        }

        // ==========================================
        // KONDISI 2: ADA TIKET (TUNGGU KONFIRMASI)
        // ==========================================
        try {
            // 1. Panggil Agent IntentAnalyzer (Tebak Setuju / Batal)
            $agent = new IntentAnalyzer();
            $analysis = $agent->prompt($originalMessage)->toArray();

            $intent = $analysis['intent'] ?? 'unclear';
            $reasoning = $analysis['reasoning'] ?? 'Tidak ada alasan';

            $this->chatLog->update([
                'resolved_by' => 'agent_intent_analyzer',
                'final_intent' => $intent,
                'llm_raw_response' => json_encode(['reasoning' => $reasoning]) 
            ]);

            // Update pesan terakhir pelanggan di tabel ServiceOrder
            $this->serviceOrder->update([
                'last_customer_message' => $originalMessage,
            ]);

            // 2. LOGIC PERUBAHAN STATUS & BALASAN OTOMATIS
            if ($intent === 'approve') {
                $this->serviceOrder->update(['status' => ServiceStatus::APPROVED]);
                $balasan = "Baik Kak, terima kasih atas konfirmasinya. Unit *{$this->serviceOrder->device->brand}* segera kami kerjakan. Kami akan kabari kembali jika sudah selesai. 🛠️";
                
                WaGateway::sendMessage($this->rawPhone, $balasan, $this->serviceOrder->id, 'intent_approve_reply');
                
            } elseif ($intent === 'cancel') {
                $this->serviceOrder->update(['status' => ServiceStatus::CANCELLED]);
                $balasan = "Baik Kak, kami paham. Servis unit *{$this->serviceOrder->device->brand}* kami batalkan. Silakan datang ke toko untuk mengambil unit Anda. Terima kasih! 🙏";
                
                WaGateway::sendMessage($this->rawPhone, $balasan, $this->serviceOrder->id, 'intent_cancel_reply');
                
            } else {
                // Jika pelanggan negosiasi harga atau bertanya di luar setuju/batal
                $history = $this->getChatHistory();
                $contextPrompt = "Info Sistem: Pelanggan tanya tentang nota " .
                    $this->serviceOrder->order_number . " (Unit: " . $this->serviceOrder->device->brand . "). Balas ramah pesan ini: '{$originalMessage}'";

                $aiResponse = (string) (new CustomerService($history))->prompt($contextPrompt);
                
                WaGateway::sendMessage($this->rawPhone, $aiResponse, $this->serviceOrder->id, 'intent_negotiate_reply');
            }
        } catch (\Throwable $e) {
            Log::error('Job Intent AI Error: ' . $e->getMessage());
            $this->chatLog->update(['resolved_by' => 'human', 'final_intent' => 'error']);
        }
    }
}