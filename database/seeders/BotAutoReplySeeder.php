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
            ['intent_name' => 'info_toko', 'response_text' => 'Toko Anugerah Computer berlokasi di Jl. Sepakat 2 No 79. Buka Senin-minggu setiap hari jam 09.00 - 21.00.'],
            ['intent_name' => 'garansi_servis', 'response_text' => 'Garansi servis kami bervariasi tergantung kerusakannya dan sparepart yang diganti, di luar human error. Pastikan nota disimpan ya Kak!'],
            ['intent_name' => 'tanya_estimasi_waktu', 'response_text' => 'Untuk pengecekan standar membutuhkan waktu 1-3 hari kerja Kak. Kami akan segera infokan jika ada perkembangan.'],
            ['intent_name' => 'salam_pembuka', 'response_text' => 'Halo Kak! Ada yang bisa kami bantu seputar servis laptop/PC di Anugerah Computer?'],
            ['intent_name' => 'penutup_terimakasih', 'response_text' => 'Sama-sama Kak! Ditunggu kedatangannya ya.'],
            ['intent_name' => 'konsultasi_kerusakan', 'response_text' => 'Keluhan tersebut bisa disebabkan oleh beberapa faktor komponen. Agar lebih pasti, silakan bawa unitnya ke toko untuk dicek langsung oleh teknisi kami ya Kak. Gratis biaya pengecekan kok!'],
        ];

        foreach ($replies as $reply) {
            BotAutoReply::updateOrCreate(
                ['intent_name' => $reply['intent_name']],
                ['response_text' => $reply['response_text']]
            );
        }
    }
}
