<?php

namespace App\Listeners;

use App\Events\ServiceOrderCreated;
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
            $pdf = Pdf::loadView('pdf.service_receipt', ['order' => $serviceOrder]);
            
            $fileName = "nota-{$serviceOrder->order_number}.pdf";
            $folderPath = "public/documents/receipts/";
            
            Storage::put($folderPath . $fileName, $pdf->output());

            Log::info("Nota PDF untuk service order {$serviceOrder->order_number} berhasil dibuat.");

        } catch (\Exception $e) {
            Log::error("Gagal membuat nota PDF untuk service order {$serviceOrder->order_number}: " . $e->getMessage());
        }
    }
}
