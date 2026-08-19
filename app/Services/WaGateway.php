<?php

namespace App\Services;

use App\Models\ChatLog;
use App\Models\ServiceOrder;
use App\Models\User;
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
                    'filename' => $filename,
                ]);

            if ($response->successful()) {
                $data = $response->json();

                // [BUGFIX]: API Baileys mungkin mereturn HTTP 200 meskipun WA belum Scan QR.
                // Kita harus mengecek field 'status' di dalam JSON-nya.
                if (isset($data['status']) && $data['status'] === false) {
                    Log::warning('Baileys API - Terhubung tapi WA belum Scan QR (Kirim Dokumen).', $data);

                    return false;
                }

                ChatLog::create([
                    'service_order_id' => $serviceOrderId,
                    'phone' => $phone,
                    'wa_message_id' => $data['messageId'] ?? null,
                    'sender_name' => 'System',
                    'message_type' => 'document',
                    'direction' => 'outbound',
                    'message' => '[Dokumen PDF] ' . $caption,
                    'resolved_by' => 'system',
                    'final_intent' => null,
                    'handling_status' => $intent,
                ]);

                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Baileys API - Gagal Kirim Dokumen: ' . $e->getMessage());

            return false;
        }
    }

    public static function sendReceiptWithPdf(ServiceOrder $order, string $pdfUrl): bool
    {
        $message = "Halo Kak *{$order->customer->name}*,\n\nUnit *{$order->device->brand} {$order->device->model}* telah berhasil didaftarkan di toko kami dengan No. Nota: *{$order->order_number}*.\n\nBerikut lampiran tanda terima unit perbaikan dalam format PDF.\n\nTerima kasih banyak atas kepercayaan Anda.\n\n-System";

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
        $message = "Halo Kak *{$order->customer->name}*,\n\nUntuk perbaikan unit *{$order->device->brand} {$order->device->model}* (Nota: *{$order->order_number}*), estimasi biayanya perbaikan *{$formattedCost}*. *{$order->technician_notes}*.\n\nApakah Anda Setuju untuk melanjutkan perbaikan dengan biaya tersebut?.\n\nTerima kasih.\n\n-System";

        return self::sendMessage($order->customer->phone, $message, $order->id, 'send_offer', 'System');
    }

    public static function sendMessage(string $phone, string $message, ?int $serviceOrderId = null, string $intent = 'notification', string $senderName = 'System', string $resolvedBy = 'system'): bool
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

                // API Baileys mungkin mereturn HTTP 200 meskipun WA belum Scan QR.
                // Kita harus mengecek field 'status' di dalam JSON-nya.
                if (isset($data['status']) && $data['status'] === false) {
                    Log::warning('Baileys API - Terhubung tapi WA belum Scan QR (Kirim Pesan).', $data);

                    return false;
                }

                ChatLog::create([
                    'service_order_id' => $serviceOrderId,
                    'phone' => $phone,
                    'wa_message_id' => $data['messageId'] ?? null,
                    'sender_name' => $senderName,
                    'message_type' => 'text',
                    'direction' => 'outbound',
                    'message' => $message,
                    'resolved_by' => $resolvedBy,
                    'final_intent' => null,
                    'handling_status' => $intent,
                ]);

                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Baileys API - Gagal Send Message: ' . $e->getMessage());

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
                $message .= 'Unit Kakak saat ini *sedang dalam proses pengerjaan* oleh teknisi kami.';
                break;
            case 'completed':
                $cost = $order->final_cost > 0 ? $order->final_cost : $order->estimated_cost;
                $formattedCost = 'Rp ' . number_format((float) $cost, 0, ',', '.');
                $message .= "Perbaikan unit Kakak *TELAH SELESAI* dan sudah bisa diambil di toko.\nTotal Biaya: *{$formattedCost}*.";
                break;
            case 'cancelled':
                $message .= 'Perbaikan unit Kakak *DIBATALKAN*. Silakan ambil unit Anda.';
                break;
            default:
                $message .= 'Status unit Kakak saat ini: *' . $order->status->label() . '*';
                break;
        }

        $message .= "\n\n-System";

        return self::sendMessage($order->customer->phone, $message, $order->id, 'status_update', 'System');
    }

    public static function getHandoverMessage(ServiceOrder $order, string $status, bool $isWarrantyClaim = false, int $warrantyDays = 0, ?string $warrantyCode = null): string
    {
        $customerName = $order->customer->name;
        $deviceName = $order->device->brand;

        if ($status === 'returned') {
            return "Halo Kak *{$customerName}*,\n\nUnit *{$deviceName}* telah Anda ambil kembali (Status: Batal Servis).\n\nTerima kasih telah berkunjung ke Anugerah Computer. Jika butuh bantuan di lain waktu, jangan ragu untuk menghubungi kami. 🙏\n\n-System";
        }

        if ($warrantyDays > 0) {
            $endDate = now()->addDays($warrantyDays)->format('d M Y');

            return "Terima kasih Kak *{$customerName}* telah mempercayakan perbaikan unit *{$deviceName}* di Anugerah Computer.\n\n"
                . "Unit Anda telah diserahkan dan masa garansi perbaikan aktif selama {$warrantyDays} hari hingga *{$endDate}*.\n"
                . "Kode Garansi: *{$warrantyCode}*\n\n"
                . "Harap simpan pesan ini sebagai bukti garansi. Semoga unitnya awet selalu! 🙏\n\n-System";
        }

        if ($isWarrantyClaim) {
            return "Halo Kak *{$customerName}*,\n\n"
                . "Unit *{$deviceName}* untuk klaim garansi telah selesai diperbaiki dan diserahkan kembali. Semoga unitnya awet dan dapat digunakan dengan lancar! Jika ada keluhan lain, jangan ragu untuk menghubungi kami. 🙏\n\n-System";
        }

        return "Terima kasih Kak *{$customerName}* telah mempercayakan perbaikan unit *{$deviceName}* di Anugerah Computer.\n\n"
            . "Unit Anda telah diserahkan. Semoga unitnya awet dan dapat digunakan dengan lancar kembali! Jika ada keluhan lain, jangan ragu untuk menghubungi kami. 🙏\n\n-System";
    }

    /**
     * [FSM STATE OVERRIDE]
     * Mengirim pesan manual dari Admin/Staff dengan menyematkan inisial/tanda tangan.
     */
    public static function sendManualMessage(string $phone, string $rawMessage, ?User $user, ?int $serviceOrderId = null): bool
    {
        $fullName = $user ? $user->name : 'Admin';
        $words = explode(' ', trim($fullName));
        $initials = count($words) >= 2 ? strtoupper(substr($words[0], 0, 1) . substr(end($words), 0, 1)) : strtoupper(substr($words[0], 0, 1));

        $finalMessage = trim($rawMessage) . "\n\n-{$initials}";

        return self::sendMessage(
            $phone,
            $finalMessage,
            $serviceOrderId,
            'manual_reply',
            'Admin (Via Web)',
            'human'
        );
    }
}
