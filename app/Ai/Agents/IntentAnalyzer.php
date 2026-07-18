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

#[Provider(Lab::GEMINI)]
class IntentAnalyzer implements Agent, Conversational, HasStructuredOutput
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'Kamu adalah AI toko komputer. '.
               'Tugas Anda HANYA menganalisis teks pelanggan. '.
               'Baca teks ini dan tentukan apakah pelanggan ingin: A. Tanya Stok (tanya_stok), B. Cek Servis (cek_servis), C. Komplain (komplain), D. Setuju (setuju), E. Batal (batal), F. Pertanyaan Umum/Lainnya (umum_teknis). '.
               'Jawab murni dalam format JSON sesuai skema tanpa teks tambahan.';
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
