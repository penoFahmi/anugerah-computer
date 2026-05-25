<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Enums\Lab;
use Stringable;

#[Provider(
    // Lab::Gemini, 
    Lab::Groq, 
    // Lab::OpenAI
)]
class CustomerService implements Agent, Conversational, HasTools
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return 'Anda adalah Customer Service yang ramah dari toko "Anugerah Computer". ' .
               'Toko ini melayani servis laptop, PC, printer, dan penjualan sparepart. ' .
               'Jam buka toko adalah Senin-Sabtu jam 09:00 - 17:00. ' .
               'Tugas Anda menjawab pertanyaan umum dari pelanggan secara singkat, sopan, dan santai. ' .
               'Jangan menjawab hal di luar konteks teknologi atau komputer. ' .
               'Jika pelanggan menanyakan status servis, beri tahu mereka untuk menunggu ' .
               'pesan otomatis dari sistem atau sebutkan nomor nota jika ada.';
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
}
