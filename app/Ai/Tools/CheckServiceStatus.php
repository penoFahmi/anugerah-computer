<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use App\Models\ServiceOrder;
use Stringable;

class CheckServiceStatus implements Tool
{
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Gunakan alat ini untuk mengecek status, estimasi biaya, dan detail servis laptop ' .
               'JIKA DAN HANYA JIKA pelanggan memberikan Nomor Nota (contoh: SRV-20260624-001).';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        // Parameterized query otomatis oleh Eloquent (Aman dari SQL Injection)
        $orderNumber = $request['order_number'] ?? '';
        
        $order = ServiceOrder::where('order_number', $orderNumber)->first();

        if (!$order) {
            return "SISTEM: Nota dengan nomor '{$orderNumber}' tidak ditemukan di sistem. Minta pelanggan memeriksa kembali.";
        }

        // ==========================================
        // BUSINESS LOGIC: Perhitungan Garansi (Hardcoded Backend)
        // ==========================================
        $warrantyStatus = 'Belum Berlaku (Servis belum berstatus Selesai)';
        
        if ($order->status->value === 'completed') {
            // Asumsi: Garansi 30 hari terhitung sejak status berubah menjadi 'completed' (diambil dari updated_at)
            $daysPassed = $order->updated_at->diffInDays(now());
            
            if ($daysPassed <= 30) {
                $daysRemaining = 30 - $daysPassed;
                $warrantyStatus = "AKTIF (Sisa {$daysRemaining} Hari)";
            } else {
                $warrantyStatus = "HANGUS/HABIS (Sudah lewat 30 hari dari tanggal selesai)";
            }
        } elseif ($order->status->value === 'cancelled') {
            $warrantyStatus = 'Tidak Ada Garansi (Servis Dibatalkan)';
        }

        // Kembalikan data baku dengan instruksi ketat agar AI tidak halusinasi
        return "DATA SISTEM (Bacakan persis seperti ini, jangan mengarang):" .
               "\nStatus Servis: " . $order->status->label() . 
               "\nEstimasi Biaya: Rp " . number_format((float) $order->estimated_cost, 0, ',', '.') .
               "\nKeluhan Awal: " . $order->complaint .
               "\nStatus Garansi: " . $warrantyStatus;
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        // Penulisan schema baru yang elegan (Fluent API)
        return [
            'order_number' => $schema->string()
                                     ->description('Nomor nota servis dari pelanggan.')
                                     ->required(),
        ];
    }
}