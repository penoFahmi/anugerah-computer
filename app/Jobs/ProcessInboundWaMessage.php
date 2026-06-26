<?php

namespace App\Jobs;

use App\Models\ChatLog;
use App\Models\ServiceOrder;
use App\Ai\Agents\IntentAnalyzer;
use App\Ai\Agents\CustomerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessInboundWaMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Menerima operan data dari WebhookController
     */
    public function __construct(
        public ChatLog $chatLog,
        public ?ServiceOrder $serviceOrder,
        public string $rawPhone
    ) {}

    /**
     * Mengeksekusi tugas berat (AI) di belakang layar
     */
    public function handle(): void
    {
        $originalMessage = $this->chatLog->message;

        // ==========================================
        // KONDISI 1: JIKA TIDAK ADA TIKET SERVIS (PESAN UMUM/CS)
        // ==========================================
        if (!$this->serviceOrder) {
            try {
                // Minta LLM memikirkan jawaban yang ramah
                $aiResponse = (string) (new CustomerService)->prompt($originalMessage);

                // Catat ke Database
                $this->chatLog->update([
                    'resolved_by' => 'llm',
                    'llm_raw_response' => $aiResponse,
                    'final_intent' => 'general_cs'
                ]);

                Http::withHeaders(['X-Token' => config('services.wa_gateway.token', 'anugerah2026')])
                    ->timeout(5)
                    ->post('http://127.0.0.1:3001/send-message', [
                        'phone' => $this->rawPhone,
                        'message' => $aiResponse
                    ]);
                    
            } catch (\Throwable $e) {
                Log::error('Job CS AI Error: ' . $e->getMessage());
                // Kalau error, biarkan admin/kasir yang balas
                $this->chatLog->update([
                    'resolved_by' => 'human',
                    'final_intent' => 'unclear'
                ]);
            }
            return; // Selesai
        }

        // ==========================================
        // KONDISI 2: JIKA ADA TIKET SERVIS (ANALISIS INTENT PENAWARAN HARGA)
        // ==========================================
        try {
            // Minta NLP/LLM untuk ngecek apakah customer setuju dengan harga servis
            $intent = (new IntentAnalyzer)->prompt($originalMessage);

            // Catat hasil tebakan AI ke Database
            $this->chatLog->update([
                'resolved_by' => 'ai_intent',
                'final_intent' => $intent,
            ]);

            // Update pesan terakhir di tabel ServiceOrder (opsional)
            $this->serviceOrder->update([
                'last_customer_message' => $originalMessage,
            ]);

            // Catatan: Proses "setuju/tidak" lanjutan dari intent ini 
            // bisa kamu tambahkan logic-nya di bawah sini (misal: otomatis update status jadi APPROVED)

        } catch (\Throwable $e) {
            Log::error('Job Intent AI Error: ' . $e->getMessage());
            $this->chatLog->update([
                'resolved_by' => 'human',
                'final_intent' => 'unclear'
            ]);
        }
    }
}
