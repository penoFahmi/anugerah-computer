<?php

namespace App\Http\Controllers;

use App\Services\WaGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Mengambil histori chat untuk ditampilkan saat kotak chat dibuka (Berdasarkan Nomor HP).
     */
    public function getHistoryByPhone(string $phone): JsonResponse
    {
        $searchPhone = str_starts_with($phone, '62') ? '0' . substr($phone, 2) : $phone;
        $searchPhone62 = str_starts_with($phone, '0') ? '62' . substr($phone, 1) : $phone;

        $chats = \App\Models\ChatLog::where(function ($q) use ($searchPhone, $searchPhone62) {
                $q->where('phone', $searchPhone)->orWhere('phone', $searchPhone62);
            })
            ->select('id', 'direction', 'message', 'resolved_by', 'created_at')
            ->latest()
            ->take(50)
            ->get()
            ->reverse()
            ->values();

        return response()->json($chats);
    }

    /**
     * Mengirim pesan ketikan manual Admin/Kasir ke Pelanggan (Berdasarkan Nomor HP).
     */
    public function sendManualByPhone(Request $request, string $phone): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:2000']);

        // Cari service order terakhir jika ada (untuk logging)
        $searchPhone = str_starts_with($phone, '62') ? '0' . substr($phone, 2) : $phone;
        $searchPhone62 = str_starts_with($phone, '0') ? '62' . substr($phone, 1) : $phone;
        $latestService = \App\Models\ServiceOrder::whereHas('customer', function($q) use ($searchPhone, $searchPhone62) {
            $q->where('phone', $searchPhone)->orWhere('phone', $searchPhone62);
        })->latest()->first();

        // Ambil inisial admin yang sedang login untuk Tanda Tangan (Signature)
        $fullName = auth()->user() ? auth()->user()->name : 'Admin';
        $words = explode(' ', trim($fullName));
        $initials = count($words) >= 2 ? strtoupper(substr($words[0], 0, 1) . substr(end($words), 0, 1)) : strtoupper(substr($words[0], 0, 1));
        $finalMessage = trim($request->message) . "\n\n-{$initials}";

        // Kirim via WA Gateway (Node.js) dengan parameter pengirim = Admin
        $isSent = WaGateway::sendMessage(
            $phone,
            $finalMessage,
            $latestService?->id,
            'manual_reply',
            'Admin (Via Web)'
        );

        if ($isSent) {
            // Tandai pesan pelanggan sebelumnya bahwa "sudah dibalas manusia"
            \App\Models\ChatLog::where(function ($q) use ($searchPhone, $searchPhone62) {
                    $q->where('phone', $searchPhone)->orWhere('phone', $searchPhone62);
                })
                ->where('direction', 'inbound')
                ->where('resolved_by', 'human')
                ->update(['resolved_by' => 'human_replied']);

            return response()->json(['status' => 'success']);
        }

        return response()->json(['error' => 'Gagal mengirim pesan, pastikan WhatsApp terhubung.'], 500);
    }
}
