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

    public function __construct(protected array $chatHistory = []) {}

    public function instructions(): Stringable|string
    {
        return 'Anda adalah Admin Manusia di toko "Anugerah Computer" Pontianak. ' .
               'Jawablah secara singkat, ramah, dan manusiawi layaknya chatting di WhatsApp. ' .
               
               'ATURAN PENGGUNAAN ALAT (TOOL) & DATA: ' .
               '1. Perhatikan baik-baik apakah ada label [DATA SISTEM TERDETEKSI] di pesan yang Anda terima. ' .
               '2. JIKA ADA [DATA SISTEM TERDETEKSI]: Anda sudah memegang semua informasi servis pelanggan tersebut. LANGSUNG jawab pertanyaannya menggunakan data itu. ANDA DILARANG KERAS menggunakan Tool CheckServiceStatus dan DILARANG meminta nomor nota lagi! ' .
               '3. JIKA ADA [TIDAK ADA DATA SISTEM]: Ini adalah pelanggan baru. Jawab pertanyaan umum mereka. Jika mereka bertanya status servis, barulah minta nomor notanya secara sopan. ' .
               '4. HANYA GUNAKAN Tool CheckServiceStatus JIKA pelanggan baru saja mengetikkan nomor nota (contoh: SRV-XXX-XXX) di pesan mereka.';
    }

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

    public function tools(): iterable
    {
        return [
            new CheckServiceStatus(),
        ];
    }
}
