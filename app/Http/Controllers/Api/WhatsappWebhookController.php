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
        // 1. Validasi Keamanan Token
        $expectedToken = config('services.wa_gateway.token');
        if ($request->header('X-Token') !== $expectedToken) {
            return response()->json(['error' => 'Unauthorized Access'], 401);
        }

        // 2. Validasi Input Dasar
        $request->validate([
            'phone' => ['required', 'string'],
            'message' => ['required', 'string', 'max:20000'],
        ]);

        $rawPhone = $request->phone;
        $originalMessage = trim($request->message);
        
        // 3. Normalisasi Nomor HP untuk pencarian (62 jadi 0)
        $searchPhone = str_starts_with($rawPhone, '62') ? '0' . substr($rawPhone, 2) : $rawPhone;

        // 4. Cari Tiket Servis Aktif (Hanya yang statusnya waiting_approval)
        $serviceOrder = ServiceOrder::whereHas('customer', function ($query) use ($rawPhone, $searchPhone) {
            $query->where('phone', $rawPhone)->orWhere('phone', $searchPhone);
        })->where('status', 'waiting_approval')->latest()->first();

        // 5. SIMPAN KE DB DULU DENGAN STATUS "PENDING"
        $chatLog = ChatLog::create([
            'service_order_id' => $serviceOrder?->id, 
            'direction' => 'inbound',
            'message' => $originalMessage,
            'resolved_by' => 'pending', 
            'final_intent' => 'analyzing',
        ]);

        // 6. LEMPAR TUGAS AI KE BACKGROUND JOB (Biar server tidak nunggu lama)
        ProcessInboundWaMessage::dispatch($chatLog, $serviceOrder, $rawPhone);

        // 7. LANGSUNG JAWAB OK KE SERVER WA SECARA INSTAN! ⚡
        return response()->json(['status' => 'queued_for_processing'], 200);
    }
}