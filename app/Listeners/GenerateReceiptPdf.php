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
            $folderPath = "public/documents/receipts/";
            
            // 2. SIMPAN PDF KE STORAGE
            Storage::put($folderPath . $fileName, $pdf->output());
            Log::info("Nota PDF untuk {$serviceOrder->order_number} berhasil dibuat.");

            // 3. KIRIM WA SETELAH PDF BENAR-BENAR TERSIMPAN (Tanpa perlu sleep!)
            $publicPdfUrl = asset(Storage::url("documents/receipts/{$fileName}"));
            WaGateway::sendReceiptWithPdf($serviceOrder, $publicPdfUrl);

        } catch (\Exception $e) {
            Log::error("Gagal membuat/mengirim nota PDF untuk {$serviceOrder->order_number}: " . $e->getMessage());
        }
    }
}
