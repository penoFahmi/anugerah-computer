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
               '1. tanya_stok: Ketersediaan barang.'.
               '2. cek_servis: Menanyakan status laptop/servisan.'.
               '3. komplain: Marah, garansi, atau komplain.'.
               '4. setuju: Kata-kata persetujuan seperti "oke", "lanjut", "setuju", "gas", "kerjakan", "mantap". '.
               '5. batal: Kata-kata penolakan seperti "batal", "tidak", "cancel", "kemahalan", "jangan". '.
               '6. umum_teknis: Pertanyaan umum atau basa-basi di luar kategori di atas. '.
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
                ->enum(['tanya_stok', 'cek_servis', 'komplain', 'setuju', 'batal', 'umum_teknis'])
                ->description('Kesimpulan akhir niat pelanggan. Jika pertanyaan umum/lainnya, pilih umum_teknis.')
                ->required(),

            'reasoning' => $schema->string()
                ->description('Alasan singkat analisis sentimen dari pesan pelanggan.')
                ->required(),
        ];
    }
}
