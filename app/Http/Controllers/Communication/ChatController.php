<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Services\WaGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * [THESIS: HYBRID INTENT RECOGNITION - ORCHESTRATOR COMPONENT]
     * Mengambil histori chat untuk ditampilkan pada panel Admin (Web UI).
     * Fungsi ini mendukung intervensi manual (Human-in-the-loop) dalam arsitektur FSM (Finite State Machine).
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
     * [THESIS: FINITE STATE MACHINE - STATE OVERRIDE]
     * Mengirim pesan ketikan manual dari Admin ke Pelanggan.
     * Tindakan ini secara otonom akan mengubah state mesin (FSM) untuk me-mute AI (Fallback ke Human).
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
            'Admin (Via Web)',
            'human'
        );

        if ($isSent) {
            // [THESIS: FSM STATE UPDATE]
            // Transisi status: Tandai bahwa kueri pelanggan telah ditangani secara manual oleh manusia,
            // sehingga metrik keterlambatan tanggapan (forgotten replies) teresolusi.
            \App\Models\ChatLog::where(function ($q) use ($searchPhone, $searchPhone62) {
                    $q->where('phone', $searchPhone)->orWhere('phone', $searchPhone62);
                })
                ->where('direction', 'inbound')
                ->where('resolved_by', 'human')
                ->update(['resolved_by' => 'human']);

            return response()->json(['status' => 'success']);
        }

        return response()->json(['error' => 'Gagal mengirim pesan, pastikan WhatsApp terhubung.'], 500);
    }

    /**
     * [THESIS: ORCHESTRATOR - REALTIME MONITORING]
     * Mengambil daftar antrean kontak untuk pemantauan latensi operasional.
     * Menggunakan query teroptimasi untuk menghitung 'unread_count' dari kueri yang belum teresolusi AI.
     */
    public function getContacts(): JsonResponse
    {
        // Gunakan Raw Query sederhana dan cepat untuk mendapatkan aktivitas terakhir dari setiap nomor
        $contacts = \App\Models\ChatLog::selectRaw('
                phone, 
                MAX(created_at) as last_activity, 
                (SELECT message FROM chat_logs as cl2 WHERE cl2.phone = chat_logs.phone ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT sender_name FROM chat_logs as cl3 WHERE cl3.phone = chat_logs.phone AND direction = "inbound" ORDER BY created_at DESC LIMIT 1) as customer_name,
                (SELECT COUNT(id) FROM chat_logs as cl4 WHERE cl4.phone = chat_logs.phone AND direction = "inbound" AND resolved_by IN ("pending", "human")) as unread_count
            ')
            ->groupBy('phone')
            ->orderByDesc('last_activity')
            ->take(30) // Ambil 30 kontak terakhir
            ->get();

        return response()->json($contacts);
    }
}

