<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BotAutoReply;

class BotAutoReplySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $replies = [
            [
                'intent_name' => 'setuju',
                'response_text' => 'Baik Kak, konfirmasi persetujuan servis telah kami terima. Kami akan menghubungi Kakak kembali jika unit sudah selesai dikerjakan. Terima kasih!'
            ],
            [
                'intent_name' => 'batal',
                'response_text' => 'Baik Kak, konfirmasi pembatalan servis telah kami terima. Proses perbaikan kami hentikan. Silakan datang ke toko untuk mengambil unit Kakak. Terima kasih! 🙏'
            ],
            [
                'intent_name' => 'lainnya',
                'response_text' => 'Halo Kak, mohon maaf saat ini asisten AI kami sedang mengalami gangguan koneksi. Pesan Kakak akan segera dibalas oleh Admin kami. Terima kasih kesabarannya 🙏'
            ],
        ];

        foreach ($replies as $reply) {
            BotAutoReply::updateOrCreate(
                ['intent_name' => $reply['intent_name']],
                ['response_text' => $reply['response_text']]
            );
        }
    }
}
