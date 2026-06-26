<?php

namespace App\Services;

use App\Models\ServiceOrder;
use App\Models\ChatLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WaGateway
{
    /**
     * Mengirimkan Pesan Teks + Lampiran Dokumen PDF Nota ke Pelanggan
     */
    public static function sendReceiptWithPdf(ServiceOrder $order, string $pdfUrl): bool
    {
        // 1. Ambil Token dan Endpoint dari config/services.php
        $token = config('services.wa_gateway.token');
        $endpoint = config('services.wa_gateway.endpoint_file', 'https://api.fonnte.com/send'); // Sesuaikan endpoint vendor

        // 2. Susun template pesan teks otomatis pembuka struk
        $message = "Halo Kak *{$order->customer->name}*,\n\n"
                 . "Unit *{$order->device->brand} {$order->device->model}* telah berhasil didaftarkan di toko kami dengan "
                 . "No. Nota: *{$order->order_number}*.\n\n"
                 . "Berikut kami lampirkan dokumen digital resmi tanda terima unit perbaikan dalam format PDF.\n\n"
                 . "Terima kasih banyak atas kepercayaan Anda.";

        try {
            // 3. Tembak API Gateway membawa parameter Dokumen/Media
            $response = Http::withHeaders([
                'Authorization' => $token
            ])->timeout(10)->post($endpoint, [
                'target' => $order->customer->phone, // Berformat internasional 62... hasil mutator
                'message' => $message,
                'url' => $pdfUrl, // Link publik storage file PDF nota Anda
                'filename' => "Nota-{$order->order_number}.pdf"
            ]);

            $isSuccess = $response->successful();

            // 4. Catat riwayat keluar ini ke tabel Chat Logs agar NLP tidak bingung melacak percakapan
            ChatLog::create([
                'service_order_id' => $order->id,
                'direction' => 'outbound',
                'message' => "[Kirim Dokumen Nota PDF] " . $message,
                'resolved_by' => 'system',
                'final_intent' => 'send_receipt'
            ]);

            return $isSuccess;

        } catch (\Exception $e) {
            Log::error("Gagal mengirimkan PDF Nota WA: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Mengirimkan pesan penawaran perbaikan via WhatsApp.
     */
    public static function sendOffer(ServiceOrder $order): bool
    {
        $token = config('services.wa_gateway.token');
        $endpoint = config('services.wa_gateway.endpoint_text', 'https://api.fonnte.com/send');

        $formattedCost = 'Rp ' . number_format($order->estimated_cost, 0, ',', '.');

        $message = "Halo Kak *{$order->customer->name}*,\n\n"
                 . "Untuk perbaikan unit *{$order->device->brand} {$order->device->model}* (Nota: *{$order->order_number}*), "
                 . "estimasi biayanya adalah sekitar *{$formattedCost}*.\n\n"
                 . "Apakah Anda setuju untuk melanjutkan perbaikan dengan biaya tersebut?\n\n"
                 . "Silakan balas *SETUJU* atau *TIDAK*.\n\n"
                 . "Terima kasih.";

        try {
            $response = Http::withHeaders([
                'Authorization' => $token
            ])->timeout(10)->post($endpoint, [
                'target' => $order->customer->phone,
                'message' => $message,
            ]);

            $isSuccess = $response->successful();

            ChatLog::create([
                'service_order_id' => $order->id,
                'direction' => 'outbound',
                'message' => $message,
                'resolved_by' => 'system',
                'final_intent' => 'send_offer'
            ]);

            return $isSuccess;

        } catch (\Exception $e) {
            Log::error("Gagal mengirimkan penawaran WA untuk nota {$order->order_number}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Mengirimkan pesan teks sederhana.
     */
    public static function sendMessage(string $phone, string $message, ?int $serviceOrderId = null, string $intent = 'notification'): bool
    {
        $token = config('services.wa_gateway.token');
        $endpoint = config('services.wa_gateway.endpoint_text', 'https://api.fonnte.com/send');

        try {
            $response = Http::withHeaders([
                'Authorization' => $token
            ])->timeout(10)->post($endpoint, [
                'target' => $phone,
                'message' => $message,
            ]);

            $isSuccess = $response->successful();

            if ($isSuccess) {
                ChatLog::create([
                    'service_order_id' => $serviceOrderId,
                    'direction' => 'outbound',
                    'message' => $message,
                    'resolved_by' => 'system',
                    'final_intent' => $intent
                ]);
            }

            return $isSuccess;

        } catch (\Exception $e) {
            Log::error("Gagal mengirimkan pesan WA ke {$phone}: " . $e->getMessage());
            return false;
        }
    }
}