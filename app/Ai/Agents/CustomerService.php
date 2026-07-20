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

#[Provider(Lab::Groq)]
class CustomerService implements Agent, Conversational, HasTools
{
    use Promptable;

    public function __construct(protected array $chatHistory = [], protected string $systemContext = '') {}

    public function instructions(): Stringable|string
    {
        return 'Anda adalah Asisten Virtual AI di toko "Anugerah Computer" Pontianak. '.
               'Anda harus membalas chat pelanggan dengan sangat natural, ramah, dan tidak kaku. '.
               'JANGAN mengulangi salam/sapaan panjang jika pelanggan sudah menyapa sebelumnya atau sedang di tengah percakapan. Langsung to the point ke pertanyaannya! '.
               'Gunakan bahasa Indonesia yang santai tapi sopan (bisa pakai emoji secukupnya). '.
               'INFO TOKO: Jl. Sepakat 2 No 79. Buka Senin-minggu jam 09.00 - 21.00. '.
               'PENTING: ANDA DILARANG KERAS menyetujui, membatalkan, atau membuat keputusan operasional servis. '.
               'Jika pelanggan curhat masalah hardware/software, berikan kemungkinan penyebab singkat, lalu arahkan untuk bawa ke toko. '.
               
               "KONTEKS SISTEM SAAT INI (Gunakan data ini untuk menjawab jika relevan, jangan ditanyakan lagi):\n{$this->systemContext}";
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
