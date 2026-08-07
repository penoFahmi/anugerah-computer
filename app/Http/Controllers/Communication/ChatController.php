<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\ChatLog;
use App\Models\ServiceOrder;
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
        $searchPhone = str_starts_with($phone, '62') ? '0'.substr($phone, 2) : $phone;
        $searchPhone62 = str_starts_with($phone, '0') ? '62'.substr($phone, 1) : $phone;

        $chats = ChatLog::where(function ($q) use ($searchPhone, $searchPhone62) {
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
        $searchPhone = str_starts_with($phone, '62') ? '0'.substr($phone, 2) : $phone;
        $searchPhone62 = str_starts_with($phone, '0') ? '62'.substr($phone, 1) : $phone;
        $latestService = ServiceOrder::whereHas('customer', function ($q) use ($searchPhone, $searchPhone62) {
            $q->where('phone', $searchPhone)->orWhere('phone', $searchPhone62);
        })->latest()->first();

        // Kirim via WA Gateway Service
        $isSent = WaGateway::sendManualMessage(
            $phone,
            $request->message,
            auth()->user(),
            $latestService?->id
        );

        if ($isSent) {
            // [THESIS: FSM STATE UPDATE]
            // Transisi status: Tandai bahwa kueri pelanggan telah ditangani secara manual oleh manusia,
            // sehingga metrik keterlambatan tanggapan (forgotten replies) teresolusi.
            ChatLog::where(function ($q) use ($searchPhone, $searchPhone62) {
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
        // 1. Dapatkan 30 nomor dengan aktivitas terbaru dan hitung pesan belum terbaca (unread)
        $recentPhones = ChatLog::select('phone')
            ->selectRaw('MAX(created_at) as last_activity')
            ->selectRaw('SUM(CASE WHEN direction = "inbound" AND resolved_by IN ("pending", "human") THEN 1 ELSE 0 END) as unread_count')
            ->groupBy('phone')
            ->orderByDesc('last_activity')
            ->take(30)
            ->get();

        $phones = $recentPhones->pluck('phone');

        if ($phones->isEmpty()) {
            return response()->json([]);
        }

        // 2. Ambil detail pesan terakhir untuk masing-masing nomor (menggunakan MAX id)
        $latestMessages = ChatLog::whereIn('phone', $phones)
            ->whereIn('id', function ($query) {
                $query->selectRaw('MAX(id)')->from('chat_logs')->groupBy('phone');
            })
            ->get()
            ->keyBy('phone');

        // 3. Ambil nama pelanggan terakhir yang mengirim pesan inbound
        $customerNames = ChatLog::whereIn('phone', $phones)
            ->where('direction', 'inbound')
            ->whereIn('id', function ($query) {
                $query->selectRaw('MAX(id)')->from('chat_logs')->where('direction', 'inbound')->groupBy('phone');
            })
            ->get()
            ->keyBy('phone');

        // 4. Gabungkan data secara efisien di level koleksi PHP (Memory O(1))
        $contacts = $recentPhones->map(function ($contact) use ($latestMessages, $customerNames) {
            return [
                'phone' => $contact->phone,
                'last_activity' => $contact->last_activity,
                'unread_count' => (int) $contact->unread_count,
                'last_message' => $latestMessages[$contact->phone]->message ?? '',
                'customer_name' => $customerNames[$contact->phone]->sender_name ?? $contact->phone,
            ];
        });

        return response()->json($contacts);
    }
}
