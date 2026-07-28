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
               '1. setuju: Kata-kata persetujuan lanjut servis seperti "oke", "lanjut", "setuju". '.
               '2. batal: Kata-kata penolakan servis seperti "batal", "tidak", "cancel", "kemahalan". '.
               '3. lainnya: SEMUA jenis percakapan selain persetujuan atau pembatalan servis (tanya harga, marah, sapaan, dll). '.
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
                ->enum(['setuju', 'batal', 'lainnya'])
                ->description('Kesimpulan akhir niat pelanggan.')
                ->required(),

            'reasoning' => $schema->string()
                ->description('Alasan singkat analisis sentimen dari pesan pelanggan.')
                ->required(),
        ];
    }
}
