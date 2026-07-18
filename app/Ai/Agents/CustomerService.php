<?php

namespace App\Ai\Agents;

use App\Ai\Tools\CheckServiceStatus;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(Lab::Gemini)]
class CustomerService implements Agent, Conversational, HasTools
{
    use Promptable;

    public function __construct(protected array $chatHistory = []) {}

    public function instructions(): Stringable|string
    {
        return 'Anda adalah Asisten Virtual AI di toko "Anugerah Computer" Pontianak, bukan manusia. '.
               'Jawablah secara singkat, ramah, dan solutif. '.
               'PENTING: ANDA DILARANG KERAS menyetujui, membatalkan, atau membuat keputusan operasional servis. Jika pelanggan meminta pembatalan servis atau menyetujui biaya, sampaikan dengan sopan bahwa Anda akan meneruskannya ke tim Admin/Teknisi. '.

               'ATURAN PENGGUNAAN ALAT (TOOL) & DATA: '.
               '1. Perhatikan baik-baik apakah ada label [DATA SISTEM TERDETEKSI] di pesan yang Anda terima. '.
               '2. JIKA ADA [DATA SISTEM TERDETEKSI]: Anda sudah memegang semua informasi servis pelanggan tersebut. LANGSUNG jawab pertanyaannya menggunakan data itu. ANDA DILARANG KERAS menggunakan Tool CheckServiceStatus dan DILARANG meminta nomor nota lagi! '.
               '3. JIKA ADA [TIDAK ADA DATA SISTEM]: Ini adalah pelanggan baru. Jawab pertanyaan umum mereka. Jika mereka bertanya status servis, barulah minta nomor notanya secara sopan. '.
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
            new CheckServiceStatus,
        ];
    }
}
