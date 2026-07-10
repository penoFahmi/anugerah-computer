<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(Lab::Groq)]
class IntentAnalyzer implements Agent, Conversational, HasStructuredOutput
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'Anda adalah asisten AI analitik internal. ' .
               'Tugas Anda HANYA menganalisis teks pelanggan terkait persetujuan biaya servis. ' .
               'Pahami konteks kalimat pelanggan (apakah setuju, batal, negosiasi, atau tidak jelas). ' .
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
                ->enum(['approve', 'cancel', 'negotiate', 'unclear'])
                ->description("Kesimpulan akhir niat pelanggan.")
                ->required(),
                
            'reasoning' => $schema->string()
                ->description("Alasan singkat analisis sentimen dari pesan pelanggan.")
                ->required(),
        ];
    }
}