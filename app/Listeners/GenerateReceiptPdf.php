<?php

namespace App\Listeners;

use App\Events\ServiceOrderCreated;
use App\Services\WaGateway;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class GenerateReceiptPdf implements ShouldQueue
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

        try {
            // 1. BUAT PDF
            $pdf = Pdf::loadView('pdf.service_receipt', ['order' => $serviceOrder]);

            $fileName = "nota-{$serviceOrder->order_number}.pdf";

            $folderPath = "documents/receipts/";

            // 2. SIMPAN PDF SECARA TEGAS KE DISK 'PUBLIC'
            Storage::disk('public')->put($folderPath . $fileName, $pdf->output());
            Log::info("Nota PDF untuk {$serviceOrder->order_number} berhasil dibuat di disk public.");

            // 3. KIRIM WA
            $publicPdfUrl = asset(Storage::url($folderPath . $fileName));

            WaGateway::sendReceiptWithPdf($serviceOrder, $publicPdfUrl);

        } catch (\Exception $e) {
            Log::error("Gagal membuat/mengirim nota PDF untuk {$serviceOrder->order_number}: " . $e->getMessage());
        }
    }
}
