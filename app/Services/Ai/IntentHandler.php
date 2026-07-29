<?php

namespace App\Services\Ai;

use App\Ai\Agents\CustomerService;
use App\Enums\ServiceStatus;
use App\Events\ChatRequiresHuman;
use App\Events\ServiceOrderBroadcast;
use App\Models\BotAutoReply;
use App\Models\ChatLog;
use App\Models\ServiceOrder;
use App\Services\WaGateway;
use Carbon\Carbon;

class IntentHandler
{
    public function handle(string $intent, ChatLog $chatLog, ?ServiceOrder $serviceOrder, string $rawPhone, array $history, string $source): void
    {
        $needsHumanHandoff = false;
        $handoffReason = '';

        // 1. CEK INTENT SETUJU / BATAL
        if (in_array($intent, ['setuju', 'batal'])) {
            if ($serviceOrder && $serviceOrder->status->value === ServiceStatus::WAITING_APPROVAL->value) {
                // Sesuai Arahan Baru: Update DB lalu ambil balasan dari bot_auto_replies untuk menghemat Token LLM!
                $newStatus = $intent === 'setuju' ? ServiceStatus::APPROVED : ServiceStatus::CANCELLED;
                $serviceOrder->update(['status' => $newStatus]);
                event(new ServiceOrderBroadcast($serviceOrder, 'updated'));

                // Langsung balas pakai teks statis dari DB (Kategori 1), lewati LLM!
                $this->handleKategori1($intent, $chatLog, $serviceOrder, $rawPhone, $source);
                return; // Stop AI di sini, menghemat resource!
            }
            // Jika bukan status WAITING_APPROVAL (misal pelanggan baru/tamu bilang "oke"),
            // kita biarkan saja LLM yang menjawab secara natural (tidak perlu Human Handoff).
            $intent = 'lainnya'; // Paksa menjadi 'lainnya' agar diteruskan ke LLM
        }

        // 2. CEK KATA KUNCI DARURAT (ADMIN/CS) SEBELUM MASUK LLM
        $lowercaseMessage = strtolower($chatLog->message);
        if (preg_match('/\b(admin|cs|manusia|operator)\b/i', $lowercaseMessage)) {
            $needsHumanHandoff = true;
            $handoffReason = "Pelanggan secara eksplisit meminta Admin/CS via kata kunci.";
        }

        // 3. EKSEKUSI HANDOFF (JIKA DIPERLUKAN)
        if ($needsHumanHandoff) {
            $this->triggerHumanHandoff($chatLog, $rawPhone, $serviceOrder, $handoffReason);
            return; // Hentikan AI di sini agar tidak membalas terus terusan
        }

        // 4. KELOMPOK AMAN (AI GENERATIF BEKERJA)
        // Jika pelanggan setuju/batal yang sah, atau sekadar tanya status/info, LLM merangkai teks balasan
        try {
            $this->handleGenerative($chatLog, $serviceOrder, $rawPhone, $history, $source, $intent);
        } catch (\Throwable $e) {
            // FALLBACK DARURAT: Jika Kuota API Groq habis atau internet mati, ambil dari DB
            \Illuminate\Support\Facades\Log::error('LLM Down, fallback to DB: '.$e->getMessage());
            $this->handleEmergencyDbFallback($intent, $chatLog, $serviceOrder, $rawPhone, $source);
        }
    }

    protected function handleEmergencyDbFallback(string $intent, ChatLog $chatLog, ?ServiceOrder $serviceOrder, string $rawPhone, string $source): void
    {
        $autoReply = BotAutoReply::where('intent_name', $intent)->first();
        
        if ($autoReply) {
            $chatLog->update([
                'resolved_by' => 'emergency_db_fallback',
                'final_intent' => $intent,
            ]);
            WaGateway::sendMessage($rawPhone, $autoReply->response_text . "\n\n-System", $serviceOrder?->id, 'db_fallback_reply', 'Sistem (DB Fallback)');
        } else {
            // Jika bot mati dan tidak ada template baku di DB, panggil Manusia!
            $this->triggerHumanHandoff($chatLog, $rawPhone, $serviceOrder, "Sistem AI (LLM) Error/Mati, dan tidak ada DB Fallback untuk intent: {$intent}");
        }
    }

    protected function handleKategori1(string $intent, ChatLog $chatLog, ?ServiceOrder $serviceOrder, string $rawPhone, string $source): void
    {
        $balasan = "";
        
        if ($intent === 'tanya_status') {
            $searchPhone = str_starts_with($rawPhone, '62') ? '0' . substr($rawPhone, 2) : $rawPhone;
            $activeOrders = ServiceOrder::whereHas('customer', function($q) use ($rawPhone, $searchPhone) {
                $q->where('phone', $rawPhone)->orWhere('phone', $searchPhone);
            })->whereNotIn('status', ['completed', 'cancelled', 'returned'])->get();

            if ($activeOrders->count() === 1) {
                $order = $activeOrders->first();
                $balasan = "Halo Kak, unit *{$order->device->brand}* Anda saat ini berstatus: *{$order->status->label()}*.";
            } elseif ($activeOrders->count() > 1) {
                $balasan = "Halo Kak, Anda memiliki beberapa unit yang sedang kami proses:\n";
                foreach($activeOrders as $order) {
                    $balasan .= "- *{$order->device->brand}*: {$order->status->label()}\n";
                }
            } else {
                $balasan = "Halo Kak, kami tidak menemukan data servis aktif untuk nomor ini. Boleh minta nomor nota servisnya (contoh: SRV-XXX-XXX)?";
            }
        } else {
        // Ambil dari database auto replies
        $autoReply = BotAutoReply::where('intent_name', $intent)->first();
        $balasan = $autoReply ? $autoReply->response_text : "Terkait hal tersebut, mohon hubungi admin kami ya Kak.";
        }

        $chatLog->update([
            'resolved_by' => $source,
            'final_intent' => $intent,
        ]);
        
        $msgType = $source === 'agent_nlp_fasttext' ? 'nlp_direct_reply' : 'llm_intent_fallback_reply';
        $senderName = $source === 'agent_nlp_fasttext' ? 'Sistem (Auto NLP)' : 'Sistem (Auto LLM)';
        WaGateway::sendMessage($rawPhone, $balasan . "\n\n-System", $serviceOrder?->id, $msgType, $senderName);
    }

    protected function handleGenerative(ChatLog $chatLog, ?ServiceOrder $serviceOrder, string $rawPhone, array $history, string $source, string $intent = 'lainnya'): void
    {
        $originalMessage = $chatLog->message;
        $systemContext = "";

        if ($serviceOrder) {
            $serviceOrder->load('warranty');
            $warrantyStatus = 'Belum terbit (karena unit belum selesai diservis atau dikembalikan)';
            if ($serviceOrder->status->value === 'completed' || $serviceOrder->status->value === 'returned') {
                if ($serviceOrder->warranty) {
                    $wStatus = strtoupper($serviceOrder->warranty->status);
                    $wEndDate = Carbon::parse($serviceOrder->warranty->end_date)->format('d M Y');
                    $warrantyStatus = "{$wStatus} (Berlaku s/d: {$wEndDate})";
                } else {
                    $warrantyStatus = "Tidak Ada Garansi";
                }
            }

            if ($serviceOrder->is_unit_left_at_store) {
                $unitLocationContext = "- Unit laptop pelanggan SAAT INI SUDAH ADA DI TOKO (telah dititipkan). JANGAN PERNAH menyuruh pelanggan membawa unit ke toko lagi. Jika mereka setuju servis, katakan saja mekanik akan langsung mengerjakannya.";
            } else {
                $unitLocationContext = "- Unit laptop pelanggan SAAT INI DIBAWA PULANG oleh pelanggan. Jika mereka setuju servis, minta mereka membawa unit kembali ke toko.";
            }

            $systemContext = 
                "- Pelanggan ini menggunakan nomor HP yang terdaftar.\n".
                "- Nota: {$serviceOrder->order_number}\n".
                "- Unit: {$serviceOrder->device->brand} {$serviceOrder->device->model}\n".
                "- Status: {$serviceOrder->status->label()}\n".
                '- Biaya: Rp '.number_format((float) $serviceOrder->estimated_cost, 0, ',', '.')."\n".
                "- Garansi: {$warrantyStatus}\n".
                "{$unitLocationContext}\n".
                "- Intent NLP: {$intent}";

            $serviceOrder->update(['last_customer_message' => $originalMessage]);
        } else {
            $systemContext = 
                "- Pelanggan baru / Tidak ada nota aktif.\n".
                "- Intent NLP: {$intent}";
        }

        // Pass history AND system context ke constructor
        $csAgent = new CustomerService($history, $systemContext);

        // HANYA kirim pesan asli pelanggan (tanpa tambahan instruksi kaku)
        $aiResponse = (string) $csAgent->prompt($originalMessage);

        // Estimasi token manual
        $csPromptTokens = (int) ceil(str_word_count((string) $csAgent->instructions().' '.$systemContext.' '.$originalMessage.' '.json_encode($history)) * 1.5);
        $csCompletionTokens = (int) ceil(str_word_count($aiResponse) * 1.5);

        // Update token dari pipeline sblmnya jika ada
        $existingPrompt = $chatLog->llm_prompt_tokens ?? 0;
        $existingCompletion = $chatLog->llm_completion_tokens ?? 0;

        $chatLog->update([
            'resolved_by' => $source, // Gunakan source (agent_nlp_fasttext / agent_intent_analyzer_fallback)
            'final_intent' => $intent,
            'llm_raw_response' => ['text' => $aiResponse],
            'llm_prompt_tokens' => $existingPrompt + $csPromptTokens,
            'llm_completion_tokens' => $existingCompletion + $csCompletionTokens,
        ]);

        WaGateway::sendMessage($rawPhone, $aiResponse . "\n\n-CS", $serviceOrder?->id, 'llm_cs_reply', 'LLM (Generative AI)');
    }

    public function triggerHumanHandoff(ChatLog $chatLog, string $rawPhone, ?ServiceOrder $serviceOrder, string $alasan): void
    {
        $balasan = 'Maaf Kak, pesan Anda akan segera ditangani langsung oleh Admin toko kami. Mohon tunggu sebentar ya. 🙏';
        WaGateway::sendMessage($rawPhone, $balasan . "\n\n-System", $serviceOrder?->id, 'human_handoff_trigger', 'Sistem (Handoff)');

        $chatLog->update([
            'resolved_by' => 'human',
            'final_intent' => $chatLog->final_intent ?? 'needs_manual_override',
            'llm_raw_response' => ['error' => $alasan],
        ]);

        $admins = \App\Models\User::all();
        \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\RequiresHumanAttention($chatLog));

        event(new ChatRequiresHuman($chatLog));
    }
}
