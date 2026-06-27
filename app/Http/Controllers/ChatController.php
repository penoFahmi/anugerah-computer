<?php

namespace App\Http\Controllers;

use App\Models\ServiceOrder;
use App\Services\WaGateway;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    // Mengambil histori chat untuk ditampilkan saat kotak chat dibuka
    public function getHistory(ServiceOrder $serviceOrder)
    {
        $chats = $serviceOrder->chatLogs()
            ->select('id', 'direction', 'message', 'resolved_by', 'created_at')
            ->latest()
            ->take(50)
            ->get()
            ->reverse()
            ->values();

        return response()->json($chats);
    }

    // Mengirim pesan ketikan manual Admin/Kasir ke Pelanggan
    public function sendManual(Request $request, ServiceOrder $serviceOrder)
    {
        $request->validate(['message' => 'required|string|max:2000']);

        // 1. Kirim via WA Gateway (Node.js)
        $isSent = WaGateway::sendMessage(
            $serviceOrder->customer->phone, 
            $request->message, 
            $serviceOrder->id, 
            'manual_reply'
        );

        if ($isSent) {
            // 2. Tandai pesan pelanggan sebelumnya bahwa "sudah dibalas manusia"
            $serviceOrder->chatLogs()
                ->where('direction', 'inbound')
                ->where('resolved_by', 'human')
                ->update(['resolved_by' => 'human_replied']);

            return response()->json(['status' => 'success']);
        }

        return response()->json(['error' => 'Gagal mengirim pesan'], 500);
    }
}