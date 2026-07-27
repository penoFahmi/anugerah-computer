<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\ChatLog;
use App\Jobs\ProcessInboundWaMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsappWebhookController extends Controller
{
    /**
     * [THESIS: WHATSAPP GATEWAY INTEGRATION & MICROSERVICES]
     * Webhook utama yang bertindak sebagai Listener/Penangkap Kueri dari peladen Node.js (Baileys).
     * Entry point untuk arsitektur Microservices.
     */
    public function handle(Request $request): JsonResponse 
    {
        try {
            $expectedToken = config('services.wa_gateway.token');
            if ($request->header('X-Token') !== $expectedToken) {
                return response()->json(['error' => 'Unauthorized Access'], 401);
            }

            $rawPhone = $request->phone;
            $originalMessage = trim($request->message);
            $isFromMe = $request->boolean('isFromMe');
            $waMessageId = $request->id; // [FIX] Tangkap ID asli
            
            // ==========================================
            // [THESIS: ECHO CANCELLATION MECHANISM]
            // Memitigasi anomali sistem berupa pantulan pesan (Echo Loop)
            // saat sistem membaca pesan outbound-nya sendiri sebagai inbound.
            // ==========================================
            if ($isFromMe) {
                $isEcho = ChatLog::where('phone', $rawPhone)
                    ->where('direction', 'outbound')
                    ->whereIn('sender_name', ['System', 'AI Assistant'])
                    ->where('message', $originalMessage)
                    ->where('created_at', '>=', now()->subSeconds(15))
                    ->exists();

                if ($isEcho) {
                    return response()->json(['status' => 'ignored_echo'], 200);
                }
            }

            $searchPhone = str_starts_with($rawPhone, '62') ? '0' . substr($rawPhone, 2) : $rawPhone;

            $serviceOrder = ServiceOrder::whereHas('customer', function ($query) use ($rawPhone, $searchPhone) {
                $query->where('phone', $rawPhone)->orWhere('phone', $searchPhone);
            })->whereNotIn('status', ['completed', 'cancelled', 'returned'])->latest()->first();

            $chatLog = ChatLog::create([
                'service_order_id' => $serviceOrder?->id, 
                'phone' => $rawPhone,
                'wa_message_id' => $waMessageId,
                'sender_name' => $isFromMe ? 'Admin (Via HP)' : ($request->pushName ?? 'Pelanggan'),
                'message_type' => $request->type ?? 'text',
                'direction' => $isFromMe ? 'outbound' : 'inbound',
                'message' => $originalMessage,
                'resolved_by' => $isFromMe ? 'human' : 'pending', 
                'final_intent' => $isFromMe ? 'manual_reply' : 'analyzing',
            ]);

            if (!$isFromMe) {
                // [THESIS: ORCHESTRATOR EVENT DRIVEN]
                // Memancarkan Event agar UI bereaksi secara Real-Time tanpa membebani Notifikasi Database.
                // Diserahkan ke Queue (Background Job) agar webhook merespons instan ke Gateway.
                broadcast(new \App\Events\NewChatMessage($chatLog));
                ProcessInboundWaMessage::dispatch($chatLog, $serviceOrder, $rawPhone);
            }

            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            Log::error('Webhook Error: ' . $e->getMessage());
            return response()->json(['status' => 'error_recorded'], 200);
        }
    }
}