<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use App\Models\ServiceOrder;
use Carbon\Carbon;
use Stringable;

/**
 * [THESIS: HYBRID INTENT RECOGNITION - LLM FALLBACK TOOL]
 * Modul ini dipicu secara otonom oleh Groq API (LLM) ketika klasifikasi FastText (NLP Lokal)
 * berada di bawah batas ambang keyakinan (alpha < 0.75). Alat ini memberdayakan LLM
 * untuk mengambil dan mengekstraksi status basis data secara terstruktur, memecahkan
 * anomali pertanyaan tingkat tinggi dari pelanggan.
 */
class CheckServiceStatus implements Tool
{
    /**
     * Deskripsi yang akan dibaca oleh AI untuk menentukan kapan alat ini boleh dipakai.
     */
    public function description(): Stringable|string
    {
        return 'Gunakan alat ini HANYA JIKA pelanggan secara eksplisit menyebutkan/mengetik Nomor Nota (contoh: SRV-20260624-001) di dalam pesan mereka untuk mencari tahu status servis.';
    }

    /**
     * Eksekusi alat untuk mengambil data dari MySQL.
     */
    public function handle(Request $request): Stringable|string
    {
        $orderNumber = $request['order_number'] ?? '';
        
        // Eager loading relasi 'warranty' agar tidak terjadi N+1 Query Problem
        $order = ServiceOrder::with('warranty')->where('order_number', $orderNumber)->first();

        // Jika nota tidak ada di database
        if (!$order) {
            return "DATA SISTEM: Nota '{$orderNumber}' tidak ditemukan di database. Beritahu pelanggan dengan sopan agar mengecek kembali ketikan nomor notanya.";
        }

        // ==========================================
        // BACA DATA GARANSI DARI TABEL 'warranties'
        // ==========================================
        $warrantyStatus = 'Tidak Ada Garansi / Belum Diterbitkan';
        
        if ($order->warranty) {
            // Ubah status bahasa Inggris ke bahasa Indonesia yang ramah pelanggan
            $statusLabel = match ($order->warranty->status) {
                'active' => 'AKTIF',
                'expired' => 'HABIS/KEDALUWARSA',
                'void' => 'DIBATALKAN (Void)',
                default => strtoupper($order->warranty->status),
            };
            
            // Format tanggal menggunakan Carbon (Contoh: 15 Aug 2026)
            $endDate = Carbon::parse($order->warranty->end_date)->format('d M Y');
            $claimCount = $order->warranty->claim_count;
            
            $warrantyStatus = "{$statusLabel} (Berlaku s/d: {$endDate}). Telah diklaim: {$claimCount} kali.";
        }

        // Kembalikan data mentah ke AI (AI akan merangkainya menjadi kalimat ramah)
        return "DATA SISTEM (Gunakan info ini untuk menjawab pertanyaan pelanggan):" .
               "\nStatus Servis: " . $order->status->label() . 
               "\nBiaya: Rp " . number_format((float) $order->estimated_cost, 0, ',', '.') .
               "\nKeluhan Awal: " . $order->complaint .
               "\nGaransi: " . $warrantyStatus;
    }

    /**
     * Skema parameter yang harus dikirim oleh AI ke alat ini.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'order_number' => $schema->string()
                ->description('Nomor nota servis yang diberikan pelanggan (format: SRV-XXX-XXX). Harus persis sesuai yang diketik.')
                ->required(),
        ];
    }
}