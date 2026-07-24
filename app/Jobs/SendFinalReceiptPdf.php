<?php

namespace App\Jobs;

use App\Models\ServiceOrder;
use App\Services\WaGateway;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SendFinalReceiptPdf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public ServiceOrder $serviceOrder,
        public string $waMessage
    ) {}

    public function handle(): void
    {
        try {
            // 1. BUAT PDF (Menggunakan ukuran kertas struk kasir termal 80mm)
            $pdf = Pdf::loadView('pdf.service_receipt', ['order' => $this->serviceOrder])
                      ->setPaper([0, 0, 226.77, 600], 'portrait'); 

            $fileName = "NotaLunas-{$this->serviceOrder->order_number}.pdf";
            $folderPath = "documents/receipts/";

            // 2. SIMPAN PDF SECARA TEGAS KE DISK 'PUBLIC'
            Storage::disk('public')->put($folderPath . $fileName, $pdf->output());
            Log::info("Nota Lunas PDF untuk {$this->serviceOrder->order_number} berhasil dibuat di disk public.");

            // 3. KIRIM WA (Panggil Gateway)
            $publicPdfUrl = asset(Storage::url($folderPath . $fileName));
            
            WaGateway::sendDocument(
                $this->serviceOrder->customer->phone,
                $this->waMessage,
                $publicPdfUrl,
                $fileName,
                $this->serviceOrder->id,
                'send_warranty'
            );

        } catch (\Exception $e) {
            Log::error("Gagal membuat/mengirim Nota Lunas PDF untuk {$this->serviceOrder->order_number}: " . $e->getMessage());
        }
    }
}
