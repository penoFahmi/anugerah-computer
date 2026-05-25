<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(
    // Lab::Gemini, 
    Lab::Groq, 
    // Lab::OpenAI
)]
class IntentAnalyzer implements Agent, Conversational, HasStructuredOutput, HasTools
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return 'Anda adalah asisten AI toko servis komputer Anugerah Computer. ' .
               'Tugas Anda HANYA menganalisis teks balasan pelanggan terkait persetujuan biaya servis. ' .
               'Pahami konteks kalimat pelanggan (apakah mereka setuju, menolak/batal, ' .
               'atau menunda karena ingin bertanya pada orang tua/keluarga). ' .
               'Jawab murni dalam format JSON sesuai skema yang diminta, tanpa teks tambahan.';
    }

    /**
     * Get the list of messages comprising the conversation so far.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
        return [];
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [];
    }

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            // Memaksa AI hanya memilih salah satu dari 3 intent ini
            'intent' => $schema->string()
                ->enum(['approve', 'cancel', 'negotiate', 'unclear'])
                ->description("Kesimpulan akhir niat pelanggan.")
                ->required(),
                
            // Meminta AI memberikan alasan singkat kenapa dia memilih intent tersebut
            // Ini akan sangat bagus untuk Bab Pembahasan di Skripsi Anda!
            'reasoning' => $schema->string()
                ->description("Alasan singkat analisis sentimen dari pesan pelanggan.")
                ->required(),
        ];
    }
}
