<?php

namespace App\Jobs;

use App\Models\ChatLog;
use App\Models\ServiceOrder;
use App\Services\Ai\ChatbotPipeline;
use App\Services\Ai\IntentHandler;
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
                'content' => $log->message,
            ];
        }

        return $history;
    }

    public function handle(ChatbotPipeline $pipeline, IntentHandler $handler): void
    {
        // ==========================================
        // CEK JEDA AI (MUTE) JIKA ADMIN SEDANG AKTIF
        // ==========================================
        // Cari pesan outbound terakhir yang dikirim oleh Admin dalam 15 menit terakhir
        $recentAdminReply = ChatLog::where('phone', $this->rawPhone)
            ->where('direction', 'outbound')
            ->whereNotIn('sender_name', ['AI Assistant', 'System'])
            ->where('created_at', '>=', now()->subMinutes(15))
            ->exists();

        if ($recentAdminReply) {
            // Admin sedang menangani chat ini, AI diam saja
            $this->chatLog->update([
                'resolved_by' => 'human',
                'final_intent' => 'muted_due_to_admin_activity',
            ]);
            Log::info("AI di-mute untuk nomor {$this->rawPhone} karena ada aktivitas Admin dalam 15 menit terakhir.");
            return;
        }

        // ==========================================
        // TAHAP 1: JALANKAN PIPELINE AI (FASTTEXT + LLM)
        // ==========================================
        $result = $pipeline->process($this->chatLog);
        
        // ==========================================
        // TAHAP 2: DELEGASIKAN TINDAKAN KE HANDLER
        // ==========================================
        $history = $this->getChatHistory();
        
        $handler->handle(
            $result['intent'], 
            $this->chatLog, 
            $this->serviceOrder, 
            $this->rawPhone, 
            $history, 
            $result['source']
        );
    }
}
