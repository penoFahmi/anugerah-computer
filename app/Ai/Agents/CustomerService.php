<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use App\Ai\Tools\CheckServiceStatus;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Enums\Lab;
use Stringable;

#[Provider(Lab::Groq)]
class CustomerService implements Agent, Conversational, HasTools
{
    use Promptable;

    // Konstruktor untuk menangkap riwayat chat dari Controller
    public function __construct(protected array $chatHistory = []) {}

    /**
     * Instruksi dasar (System Prompt)
     */
    public function instructions(): Stringable|string
    {
        return 'Anda adalah Asisten Customer Service dari toko "Anugerah Computer". ' .
               'Toko melayani servis laptop, PC, printer, dan penjualan sparepart. ' .
               'Jam operasional: Buka setiap hari (09:00 - 21:00 WIB). Lokasi: Jl. Sepakat 2, Pontianak. ' .
               'Tugas Anda menjawab singkat, sopan, dan empatik. Jangan jawab hal di luar konteks IT. ' .
               'ATURAN KETAT (SECURITY GUARDRAIL): ' .
               '1. Jika pelanggan menanyakan status servis, biaya, atau GARANSI, WAJIB panggil tool untuk mengecek database. ' .
               '2. JANGAN PERNAH MENGARANG ATAU BERASUMSI SOAL MASA GARANSI. Anda hanya boleh menyebutkan status garansi PERSIS seperti yang dikembalikan oleh tool. ' .
               '3. Jika status masih dikerjakan, tegaskan bahwa garansi belum berlaku.';
    }

    /**
     * Memasukkan riwayat percakapan agar AI ingat chat sebelumnya.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
        $messages = [];
        
        foreach ($this->chatHistory as $msg) {
            $messages[] = new Message(
                role: $msg['role'] === 'user' ? 'user' : 'assistant', 
                content: $msg['content']
            );
        }

        return $messages;
    }

    /**
     * Mendaftarkan alat yang bisa dipakai oleh AI.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new CheckServiceStatus(),
        ];
    }
}
