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
        return config('services.wa_gateway.url');
    }

    private static function getToken(): string
    {
        return config('services.wa_gateway.token');
    }

    public static function sendDocument(string $phone, string $caption, string $pdfUrl, string $filename, ?int $serviceOrderId = null, string $intent = 'notification'): bool
    {
        $endpoint = self::getBaseUrl() . '/send-document';

        try {
            $response = Http::withHeaders(['X-Token' => self::getToken()])
                ->timeout(15) 
                ->post($endpoint, [
                    'phone' => $phone,
                    'caption' => $caption,
                    'document' => $pdfUrl,
                    'filename' => $filename
                ]);

            if ($response->successful()) {
                $data = $response->json();
                ChatLog::create([
                    'service_order_id' => $serviceOrderId,
                    'phone' => $phone,
                    'wa_message_id' => $data['messageId'] ?? null,
                    'sender_name' => 'System',
                    'message_type' => 'document',
                    'direction' => 'outbound',
                    'message' => "[Dokumen PDF] " . $caption,
                    'resolved_by' => 'system',
                    'final_intent' => $intent
                ]);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error("Baileys API - Gagal Kirim Dokumen: " . $e->getMessage());
            return false;
        }
    }

    public static function sendReceiptWithPdf(ServiceOrder $order, string $pdfUrl): bool
    {
        $message = "Halo Kak *{$order->customer->name}*,\n\nUnit *{$order->device->brand} {$order->device->model}* telah berhasil didaftarkan di toko kami dengan No. Nota: *{$order->order_number}*.\n\nBerikut lampiran tanda terima unit perbaikan dalam format PDF.\n\nTerima kasih banyak atas kepercayaan Anda.";
        return self::sendDocument(
            $order->customer->phone, 
            $message, 
            $pdfUrl, 
            "TandaTerima-{$order->order_number}.pdf", 
            $order->id, 
            'send_receipt'
        );
    }

    public static function sendOffer(ServiceOrder $order): bool
    {
        $formattedCost = 'Rp ' . number_format($order->estimated_cost, 0, ',', '.');
        $message = "Halo Kak *{$order->customer->name}*,\n\nUntuk perbaikan unit *{$order->device->brand} {$order->device->model}* (Nota: *{$order->order_number}*), estimasi biayanya adalah sekitar *{$formattedCost}*. *{$order->technician_notes}*.\n\nApakah Anda setuju untuk melanjutkan perbaikan dengan biaya tersebut?\n\nSilakan balas *SETUJU* atau *TIDAK*.\n\nTerima kasih.";

        return self::sendMessage($order->customer->phone, $message, $order->id, 'send_offer', 'System');
    }

    public static function sendMessage(string $phone, string $message, ?int $serviceOrderId = null, string $intent = 'notification', string $senderName = 'AI Assistant'): bool
    {
        $endpoint = self::getBaseUrl() . '/send-message';

        try {
            $response = Http::withHeaders(['X-Token' => self::getToken()])
                ->timeout(10)
                ->post($endpoint, [
                    'phone' => $phone,
                    'message' => $message,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                ChatLog::create([
                    'service_order_id' => $serviceOrderId,
                    'phone' => $phone,
                    'wa_message_id' => $data['messageId'] ?? null,
                    'sender_name' => $senderName,
                    'message_type' => 'text',
                    'direction' => 'outbound',
                    'message' => $message,
                    'resolved_by' => 'system',
                    'final_intent' => $intent
                ]);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error("Baileys API - Gagal Send Message: " . $e->getMessage());
            return false;
        }
    }

    public static function sendStatusUpdate(ServiceOrder $order): bool
    {
        $customerName = $order->customer->name;
        $deviceName = $order->device->brand . ' ' . $order->device->model;
        $orderNumber = $order->order_number;
        $note = $order->technician_notes;

        $message = "Halo Kak *{$customerName}*,\nBerikut adalah update untuk unit *{$deviceName}* (Nota: {$orderNumber}):\n\n";

        if ($note) {
            $message .= "Catatan teknisi: *{$note}*\n\n";
        }

        switch ($order->status->value) {
            case 'approved':
            case 'in_progress':
                $message .= "Unit Kakak saat ini *sedang dalam proses pengerjaan* oleh teknisi kami.";
                break;
            case 'completed':
                $cost = $order->final_cost > 0 ? $order->final_cost : $order->estimated_cost;
                $formattedCost = 'Rp ' . number_format((float) $cost, 0, ',', '.');
                $message .= "Perbaikan unit Kakak *TELAH SELESAI* dan sudah bisa diambil di toko.\nTotal Biaya: *{$formattedCost}*.";
                break;
            case 'cancelled':
                $message .= "Perbaikan unit Kakak *DIBATALKAN*. Silakan ambil unit Anda.";
                break;
            default:
                $message .= "Status unit Kakak saat ini: *" . $order->status->label() . "*";
                break;
        }

        $message .= "\n\n-System";

        return self::sendMessage($order->customer->phone, $message, $order->id, 'status_update', 'System');
    }
}
