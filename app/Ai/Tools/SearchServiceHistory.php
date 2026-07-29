<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use App\Models\ServiceOrder;
use Stringable;

class SearchServiceHistory implements Tool
{
    /**
     * Deskripsi yang akan dibaca oleh AI untuk menentukan kapan alat ini boleh dipakai.
     */
    public function description(): Stringable|string
    {
        return 'Gunakan alat ini jika pelanggan menanyakan perkiraan HARGA atau WAKTU (SLA) untuk kerusakan/keluhan tertentu (misal: "Berapa biaya ganti LCD Acer?", "Berapa lama instal ulang Windows?"). Alat ini akan mencari data historis servis terdahulu.';
    }

    /**
     * Eksekusi alat untuk mengambil data dari MySQL.
     */
    public function handle(Request $request): Stringable|string
    {
        $keyword = $request['keyword'] ?? '';
        
        if (empty($keyword)) {
            return "Katakunci pencarian kosong.";
        }

        // Cari riwayat servis yang sudah selesai, mirip dengan keluhan
        $history = ServiceOrder::with('device')
            ->whereIn('status', ['completed', 'taken'])
            ->where(function($q) use ($keyword) {
                $q->where('complaint', 'LIKE', "%{$keyword}%")
                  ->orWhere('technician_notes', 'LIKE', "%{$keyword}%");
            })
            ->latest()
            ->take(5)
            ->get();

        if ($history->isEmpty()) {
            return "Tidak ditemukan riwayat servis terkait '{$keyword}'. Jawablah bahwa Anda tidak bisa memastikan kisaran harga, pelanggan mohon menunggu balasan Admin atau segera bawa unit ke toko untuk dicek fisik.";
        }

        $minPrice = $history->min('final_cost');
        $maxPrice = $history->max('final_cost');
        
        // Format harga (contoh: Rp 150.000)
        $formattedMin = "Rp " . number_format($minPrice, 0, ',', '.');
        $formattedMax = "Rp " . number_format($maxPrice, 0, ',', '.');

        $priceRange = $minPrice == $maxPrice ? $formattedMin : "{$formattedMin} - {$formattedMax}";

        // Analisis waktu pengerjaan (SLA)
        $durations = [];
        foreach ($history as $order) {
            if ($order->created_at && $order->updated_at) {
                $durations[] = $order->created_at->diffInDays($order->updated_at);
            }
        }
        $avgDays = count($durations) > 0 ? ceil(array_sum($durations) / count($durations)) : 0;
        $slaInfo = $avgDays > 0 ? "sekitar {$avgDays} hari" : "kurang dari 1 hari";

        return <<<RESULT
Ditemukan {$history->count()} kasus servis terdahulu mirip '{$keyword}'.
- RENTANG HARGA HISTORIS: {$priceRange}
- RATA-RATA WAKTU SELESAI: {$slaInfo}

PENTING UNTUK AI: Gunakan data di atas untuk menjawab pelanggan. TETAPI Ingat Aturan SOP No.2 dan 3: JANGAN menjanjikan angka pasti. Beritahu mereka bahwa itu hanya KISARAN berdasarkan riwayat, dan pastinya menunggu pengecekan fisik/konfirmasi Admin!
RESULT;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'keyword' => $schema->string()
                ->description('Katakunci kerusakan atau jenis servis (contoh: "Ganti LCD", "Mati Total", "Instal Ulang"). Ekstrak dari pertanyaan pengguna.')
                ->required(),
        ];
    }
}
