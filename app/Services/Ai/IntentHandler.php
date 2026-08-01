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
            if ($serviceOrder) {
                // [BUG FIXED]: Mencegah Race Condition dengan DB::transaction & Pessimistic Locking
                $isProcessed = \Illuminate\Support\Facades\DB::transaction(function () use ($serviceOrder, $intent, $chatLog, $rawPhone, $source) {
                    // Kunci baris data servis ini secara spesifik sampai operasi update selesai
                    $lockedOrder = ServiceOrder::where('id', $serviceOrder->id)->lockForUpdate()->first();
                    
                    if ($lockedOrder && $lockedOrder->status->value === ServiceStatus::WAITING_APPROVAL->value) {
                        $newStatus = $intent === 'setuju' ? ServiceStatus::APPROVED : ServiceStatus::CANCELLED;
                        $lockedOrder->update(['status' => $newStatus]);
                        
                        event(new ServiceOrderBroadcast($lockedOrder, 'updated'));
                        $this->handleKategori1($intent, $chatLog, $lockedOrder, $rawPhone, $source);
                        
                        return true;
                    }
                    return false;
                });

                if ($isProcessed) {
                    return; // Transaksi berhasi dieksekusi, hentikan AI di sini.
                }
            }
            // Jika bukan status WAITING_APPROVAL (misal pelanggan baru/tamu bilang "oke"),
            // kita biarkan saja LLM yang menjawab secara natural (tidak perlu Human Handoff).
            $intent = 'lainnya'; // Paksa menjadi 'lainnya' agar diteruskan ke LLM
        }

        // 2. CEK KATA KUNCI DARURAT (ADMIN/CS) ATAU PEMBATALAN SEPIHAK
        $lowercaseMessage = strtolower($chatLog->message);
        if (preg_match('/\b(admin|cs|manusia|operator)\b/i', $lowercaseMessage)) {
            $needsHumanHandoff = true;
            $handoffReason = "Pelanggan secara eksplisit meminta Admin/CS via kata kunci.";
        }
        
        // Cek jika status sudah disetujui/dikerjakan, lalu user mencoba batal
        if (!$needsHumanHandoff && $serviceOrder && in_array($serviceOrder->status->value, ['approved', 'in_progress'])) {
            if ($intent === 'batal' || preg_match('/\b(batal|cancel|gak jadi|ndak jadi|tdk jadi|tidak jadi|urung|cancel)\b/i', $lowercaseMessage)) {
                $needsHumanHandoff = true;
                $handoffReason = "Pelanggan mencoba membatalkan servis yang sudah berstatus " . $serviceOrder->status->label() . ". Membutuhkan intervensi Admin.";
            }
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
                'resolved_by' => 'system',
                'handling_status' => 'db_fallback_triggered',
                'final_intent' => $intent, // Intent still valid
            ]);
            WaGateway::sendMessage($rawPhone, $autoReply->response_text . "\n\n-System", $serviceOrder?->id, 'db_fallback_reply', 'System');
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
            })->whereNotIn('status', ['completed', 'cancelled', 'returned', 'taken'])->get();

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

        $isLlm = ($source !== 'agent_nlp_fasttext');
        $resolvedBy = $isLlm ? 'llm_model' : 'nlp_model';
        
        $chatLog->update([
            'resolved_by' => $resolvedBy,
            'handling_status' => 'processed',
            'final_intent' => $intent,
        ]);
        
        $msgType = $isLlm ? 'llm_intent_fallback_reply' : 'nlp_direct_reply';
        $senderName = $isLlm ? 'AI Customer Servis' : 'System';
        $signature = $isLlm ? '-CS' : '-System';
        
        // Pesan keluarnya (outbound) dicatat sebagai 'system' jika dari NLP (karena teksnya baku), 
        // tapi 'llm_model' jika dari LLM (karena teksnya dikarang oleh AI).
        $outboundResolver = $isLlm ? 'llm_model' : 'system';

        WaGateway::sendMessage($rawPhone, $balasan . "\n\n" . $signature, $serviceOrder?->id, $msgType, $senderName, $outboundResolver);
    }

    protected function handleGenerative(ChatLog $chatLog, ?ServiceOrder $serviceOrder, string $rawPhone, array $history, string $source, string $intent = 'lainnya'): void
    {
        $originalMessage = $chatLog->message;
        $systemContext = "";

        if ($serviceOrder) {
            $serviceOrder->load('warranty');
            $warrantyStatus = 'Belum terbit (karena unit belum selesai diservis atau dikembalikan)';
            if (in_array($serviceOrder->status->value, ['completed', 'returned', 'taken'])) {
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

        $resolvedBy = 'llm_model';
        $chatLog->update([
            'resolved_by' => $resolvedBy,
            'handling_status' => 'processed',
            'final_intent' => $intent,
            'llm_raw_response' => ['text' => $aiResponse],
            'llm_prompt_tokens' => $existingPrompt + $csPromptTokens,
            'llm_completion_tokens' => $existingCompletion + $csCompletionTokens,
        ]);

        WaGateway::sendMessage($rawPhone, $aiResponse . "\n\n-CS", $serviceOrder?->id, 'llm_cs_reply', 'AI Customer Servis', $resolvedBy);
    }

    public function triggerHumanHandoff(ChatLog $chatLog, string $rawPhone, ?ServiceOrder $serviceOrder, string $alasan): void
    {
        $balasan = 'Maaf Kak, pesan Anda akan segera ditangani langsung oleh Admin toko kami. Mohon tunggu sebentar ya. 🙏';
        WaGateway::sendMessage($rawPhone, $balasan . "\n\n-System", $serviceOrder?->id, 'human_handoff_trigger', 'System');

        $chatLog->update([
            'resolved_by' => 'system',
            'handling_status' => 'handoff_triggered',
            'final_intent' => $chatLog->final_intent ?? 'lainnya',
            'llm_raw_response' => ['error' => $alasan],
        ]);

        $admins = \App\Models\User::all();
        \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\RequiresHumanAttention($chatLog));

        event(new ChatRequiresHuman($chatLog));
    }
}
