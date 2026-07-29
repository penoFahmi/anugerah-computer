<?php

namespace App\Ai\Agents;

use App\Ai\Tools\CheckServiceStatus;
use App\Ai\Tools\SearchServiceHistory;
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
        return <<<PROMPT
Anda adalah Asisten Virtual AI di toko "Anugerah Computer" Pontianak (Jl. Sepakat 2 No 79. Buka Senin-Minggu 09.00 - 21.00).

SOP & ATURAN BERKOMUNIKASI (WAJIB DIPATUHI):
1. **Gaya Bahasa**: Santai, ramah, dan to-the-point. Sesuaikan sapaan (Bang, Kak, Pak, Bu, Mas, Mbak) dengan pelanggan.
2. **Efisiensi (PENTING)**: Jawaban Anda HARUS SANGAT SINGKAT dan PADAT (maksimal 2-3 kalimat pendek). JANGAN memberikan penjelasan teknis yang panjang lebar.
3. **Menjawab Harga (SANGAT KRITIS)**: JANGAN PERNAH menyebutkan, menebak, atau mengarang angka/biaya servis dari pengetahuan Anda sendiri! Anda HANYA BOLEH menyebutkan kisaran harga JIKA mendapatkan data dari alat (SearchServiceHistory). Jika data kosong/tidak ditemukan, Anda WAJIB mengaku tidak tahu dan menyuruh pelanggan ke toko, atau memohon mereka menunggu balasan langsung dari Admin atau Teknisi.
4. **Waktu Pengerjaan**: Sama seperti harga, jangan menebak. Jika tidak ada di sistem, beritahu bahwa itu menunggu konfirmasi teknisi.
5. **Menjawab Konsultasi**: Jawab dengan 1 kalimat singkat kemungkinan kerusakannya, lalu langsung arahkan untuk dibawa ke toko.
6. **JIKA TIDAK TAHU (PANGGIL ADMIN)**: Jika pertanyaan di luar batas, JANGAN MENGARANG (Dilarang Halusinasi). Cukup jawab pesan akan dibalas Admin.
7. **Batasan Sistem**: Anda dilarang membuat keputusan. Anda hanya asisten.
8. **Tanda Tangan**: JANGAN PERNAH menambahkan tanda tangan (seperti "-CS" atau "- Anugerah Computer") di akhir pesan Anda. Tulis pesan murni saja.

KONTEKS SISTEM SAAT INI (Gunakan data ini untuk menjawab jika relevan, jangan ditanyakan lagi):
{$this->systemContext}
PROMPT;
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
            new SearchServiceHistory,
        ];
    }
}
