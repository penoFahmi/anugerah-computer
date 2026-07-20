<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(Lab::Groq)]
class IntentAnalyzer implements Agent, Conversational, HasStructuredOutput
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'Anda adalah mesin pemroses NLP otomatis. DILARANG MERESPON DENGAN TEKS BIASA. '.
               'Tugas Anda HANYA mengklasifikasikan intent pelanggan ke opsi berikut: '.
               '1. info_toko: Menanyakan alamat, lokasi, atau jam operasional. '.
               '2. tanya_status: Menanyakan status pengerjaan atau unit servisan. '.
               '3. garansi_servis: Menanyakan garansi servis atau klaim garansi. '.
               '4. tanya_estimasi_waktu: Menanyakan berapa lama servis dikerjakan. '.
               '5. salam_pembuka: Sapaan awal seperti "halo", "p", "siang min". '.
               '6. penutup_terimakasih: Ucapan terima kasih atau mengakhiri percakapan. '.
               '7. tanya_harga_servis: Menanyakan estimasi biaya servis. '.
               '8. konsultasi_kerusakan: Curhat masalah laptop/komputer, tanya bisa diservis/tidak. '.
               '9. nego_harga: Meminta diskon atau potongan harga. '.
               '10. setuju: Kata-kata persetujuan lanjut servis seperti "oke", "lanjut", "setuju". '.
               '11. batal: Kata-kata penolakan servis seperti "batal", "tidak", "cancel", "kemahalan". '.
               'WAJIB KEMBALIKAN OUTPUT HANYA DALAM BENTUK JSON MURNI SESUAI SKEMA.';
    }

    public function messages(): iterable
    {
        return [];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'intent' => $schema->string()
                ->enum(['info_toko', 'tanya_status', 'garansi_servis', 'tanya_estimasi_waktu', 'salam_pembuka', 'penutup_terimakasih', 'tanya_harga_servis', 'konsultasi_kerusakan', 'nego_harga', 'setuju', 'batal'])
                ->description('Kesimpulan akhir niat pelanggan.')
                ->required(),

            'reasoning' => $schema->string()
                ->description('Alasan singkat analisis sentimen dari pesan pelanggan.')
                ->required(),
        ];
    }
}
