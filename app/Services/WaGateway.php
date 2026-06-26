<?php

namespace App\Services;

use App\Models\ServiceOrder;
use App\Models\ChatLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WaGateway
{
    private static function getBaseUrl(): string
    {
        return 'http://127.0.0.1:3001';
    }

    // Ambil token untuk dikirim ke Node.js
    private static function getToken(): string
    {
        return config('services.wa_gateway.token', 'anugerah2026');
    }

    public static function sendReceiptWithPdf(ServiceOrder $order, string $pdfUrl): bool
    {
        $endpoint = self::getBaseUrl() . '/send-document';
        $message = "Halo Kak *{$order->customer->name}*,\n\nUnit *{$order->device->brand} {$order->device->model}* telah berhasil didaftarkan di toko kami dengan No. Nota: *{$order->order_number}*.\n\nBerikut lampiran tanda terima unit perbaikan dalam format PDF.\n\nTerima kasih banyak atas kepercayaan Anda.";

        try {
            // TAMBAHAN HEADER X-Token
            $response = Http::withHeaders(['X-Token' => self::getToken()])
                ->timeout(10)
                ->post($endpoint, [
                    'phone' => $order->customer->phone,
                    'caption' => $message,
                    'document' => $pdfUrl,
                    'filename' => "Nota-{$order->order_number}.pdf"
                ]);

            if ($response->successful()) {
                ChatLog::create([
                    'service_order_id' => $order->id,
                    'direction' => 'outbound',
                    'message' => "[Dokumen PDF] " . $message,
                    'resolved_by' => 'system',
                    'final_intent' => 'send_receipt'
                ]);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error("Baileys API - Gagal PDF: " . $e->getMessage());
            return false;
        }
    }

    public static function sendOffer(ServiceOrder $order): bool
    {
        $endpoint = self::getBaseUrl() . '/send-message';
        $formattedCost = 'Rp ' . number_format($order->estimated_cost, 0, ',', '.');
        $message = "Halo Kak *{$order->customer->name}*,\n\nUntuk perbaikan unit *{$order->device->brand} {$order->device->model}* (Nota: *{$order->order_number}*), estimasi biayanya adalah sekitar *{$formattedCost}*.\n\nApakah Anda setuju untuk melanjutkan perbaikan dengan biaya tersebut?\n\nSilakan balas *SETUJU* atau *TIDAK*.\n\nTerima kasih.";

        try {
            // TAMBAHAN HEADER X-Token
            $response = Http::withHeaders(['X-Token' => self::getToken()])
                ->timeout(10)
                ->post($endpoint, [
                    'phone' => $order->customer->phone,
                    'message' => $message,
                ]);

            if ($response->successful()) {
                ChatLog::create([
                    'service_order_id' => $order->id,
                    'direction' => 'outbound',
                    'message' => $message,
                    'resolved_by' => 'system',
                    'final_intent' => 'send_offer'
                ]);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error("Baileys API - Gagal Offer: " . $e->getMessage());
            return false;
        }
    }
}
