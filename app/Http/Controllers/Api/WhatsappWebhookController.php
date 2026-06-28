<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\ChatLog;
use App\Jobs\ProcessInboundWaMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsappWebhookController extends Controller
{
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
            
            $searchPhone = str_starts_with($rawPhone, '62') ? '0' . substr($rawPhone, 2) : $rawPhone;

            // Cari nota
            $serviceOrder = ServiceOrder::whereHas('customer', function ($query) use ($rawPhone, $searchPhone) {
                $query->where('phone', $rawPhone)->orWhere('phone', $searchPhone);
            })->where('status', 'waiting_approval')->latest()->first();

            // SIMPAN KE DB
            $chatLog = ChatLog::create([
                'service_order_id' => $serviceOrder?->id, 
                'phone' => $rawPhone,
                // Jika dari Admin HP, beri nama "Admin". Jika dari pelanggan, pakai PushName.
                'sender_name' => $isFromMe ? 'Admin (Via HP)' : ($request->pushName ?? 'Pelanggan'),
                'message_type' => $request->type ?? 'text',
                // Atur arah panah pesannya
                'direction' => $isFromMe ? 'outbound' : 'inbound',
                'message' => $originalMessage,
                // Jika dari Admin, tandai selesai. Jika pelanggan, beri pending untuk AI.
                'resolved_by' => $isFromMe ? 'human' : 'pending', 
                'final_intent' => $isFromMe ? 'manual_reply' : 'analyzing',
            ]);

            // HANYA SURUH AI MIKIR JIKA INI PESAN DARI PELANGGAN!
            if (!$isFromMe) {
                ProcessInboundWaMessage::dispatch($chatLog, $serviceOrder, $rawPhone);
            }

            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            Log::error('Webhook Error: ' . $e->getMessage());
            // Tetap jawab Sukses agar Baileys tidak mengira gagal
            return response()->json(['status' => 'error_recorded'], 200);
        }
    }
}