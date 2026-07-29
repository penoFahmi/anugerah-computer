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

    public $timeout = 120;
    public $tries = 1;

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
            // Bersihkan signature dari history agar LLM tidak menirunya
            $cleanMsg = str_replace(["\n\n-CS", "\n\n-System"], "", $log->message);
            $history[] = [
                'role' => $log->direction === 'inbound' ? 'user' : 'assistant',
                'content' => trim($cleanMsg),
            ];
        }

        return $history;
    }

    public function handle(ChatbotPipeline $pipeline, IntentHandler $handler): void
    {
        // ==========================================
        // [THESIS: HYBRID INTENT RECOGNITION - FSM MUTE STATE]
        // CEK JEDA AI (MUTE) JIKA ADMIN SEDANG AKTIF INTERVENSI
        // ==========================================
        
        // 1. Cek apakah ada permintaan Handoff yang belum dibalas Admin
        $latestHandoffRequest = ChatLog::where('phone', $this->rawPhone)
            ->where('direction', 'inbound')
            ->where('resolved_by', 'human')
            ->where('created_at', '>=', now()->subMinutes(30))
            ->latest()
            ->first();

        if ($latestHandoffRequest) {
            $adminRepliedSinceHandoff = ChatLog::where('phone', $this->rawPhone)
                ->where('direction', 'outbound')
                ->whereNotIn('sender_name', ['AI Assistant', 'System'])
                ->where('created_at', '>=', $latestHandoffRequest->created_at)
                ->exists();
                
            if (!$adminRepliedSinceHandoff) {
                // Mute AI karena menunggu balasan Admin
                $this->chatLog->update([
                    'resolved_by' => 'human',
                    'final_intent' => 'muted_waiting_for_admin',
                ]);
                Log::info("AI di-mute untuk nomor {$this->rawPhone} karena sedang menunggu antrean balasan Admin.");
                return;
            }
        }

        // 2. Cari pesan outbound terakhir yang dikirim oleh Admin dalam 15 menit terakhir
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
        // [THESIS: TAHAP 1 - JALANKAN PIPELINE AI HIBRIDA]
        // Menerapkan NLP engine (FastAPI/FastText/SVM) sebagai lapis pertama.
        // Jika alpha < 0.75, memicu mekanisme Fallback ke LLM (Groq API).
        // ==========================================
        $result = $pipeline->process($this->chatLog);
        
        // ==========================================
        // [THESIS: TAHAP 2 - DELEGASIKAN TINDAKAN KE HANDLER]
        // FSM mengeksekusi transisi status servis (Update Deterministik)
        // berdasarkan parameter niat operasional yang terklasifikasi.
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

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Job ProcessInboundWaMessage Gagal/Timeout: " . $exception->getMessage());
        
        // Jangan biarkan status menggantung di 'analyzing'
        $this->chatLog->update([
            'resolved_by' => 'human',
            'final_intent' => 'needs_manual_override',
            'llm_raw_response' => ['error' => 'Sistem AI (Groq) kehabisan waktu atau gagal memproses.'],
        ]);

        // Beritahu Admin
        $admins = \App\Models\User::all();
        \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\RequiresHumanAttention($this->chatLog));
        event(new \App\Events\ChatRequiresHuman($this->chatLog));
    }
}
