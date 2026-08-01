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

    public function handle(ServiceOrderCreated $event): void
    {
        $serviceOrder = $event->serviceOrder;

        try {
            // 1. BUAT PDF (Menggunakan ukuran kertas struk kasir termal 80mm)
            $pdf = Pdf::loadView('pdf.service_receipt', ['order' => $serviceOrder])
                      ->setPaper([0, 0, 226.77, 600], 'portrait'); 

            $fileName = "nota-{$serviceOrder->order_number}.pdf";
            $folderPath = "documents/receipts/";

            // 2. SIMPAN PDF KE DISK 'PUBLIC'
            Storage::disk('public')->put($folderPath . $fileName, $pdf->output());
            Log::info("Nota PDF untuk {$serviceOrder->order_number} berhasil dibuat di disk public.");

            // 3. KIRIM WA (JIKA DIIZINKAN)
            if ($event->sendWa) {
                $publicPdfUrl = asset(Storage::url($folderPath . $fileName));
                WaGateway::sendReceiptWithPdf($serviceOrder, $publicPdfUrl);
            } else {
                Log::info("Kirim WA untuk {$serviceOrder->order_number} di-skip karena instruksi Simpan Saja.");
            }

        } catch (\Exception $e) {
            Log::error("Gagal membuat/mengirim nota PDF untuk {$serviceOrder->order_number}: " . $e->getMessage());
        }
    }
}
