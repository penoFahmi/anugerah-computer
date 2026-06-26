<?php

namespace App\Listeners;

use App\Events\ServiceOrderCreated;
use App\Services\WaGateway;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SendWhatsAppReceipt implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(ServiceOrderCreated $event): void
    {
        $serviceOrder = $event->serviceOrder;
        $fileName = "nota-{$serviceOrder->order_number}.pdf";
        $filePath = "public/documents/receipts/{$fileName}";

        // Simple delay to increase the chance of the PDF being ready.
        // In a high-load environment, a more robust solution like job chaining or
        // a delayed job dispatch would be better to avoid race conditions.
        sleep(2); 

        if (!Storage::exists($filePath)) {
            Log::error("Nota PDF tidak ditemukan di '{$filePath}' untuk dikirim via WA. Order: {$serviceOrder->order_number}. Listener ini mungkin berjalan sebelum PDF selesai dibuat.");
            // We can re-queue the job to try again later.
            $this->release(30);
            return;
        }

        try {
            $publicPdfUrl = asset(Storage::url("documents/receipts/{$fileName}"));

            WaGateway::sendReceiptWithPdf($serviceOrder, $publicPdfUrl);
            
            Log::info("Nota WhatsApp untuk service order {$serviceOrder->order_number} berhasil dikirim.");

        } catch (\Exception $e) {
            Log::error("Gagal mengirim nota WhatsApp untuk service order {$serviceOrder->order_number}: " . $e->getMessage());
        }
    }
}
