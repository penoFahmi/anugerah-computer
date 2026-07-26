<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StoreSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\StoreSetting::updateOrCreate(
            ['id' => 1],
            [
                'store_name' => 'Anugerah Computer',
                'hero_headline' => 'Solusi Cerdas untuk',
                'hero_headline_highlight' => 'Laptop & Servis',
                'hero_badge' => 'Pusat Layanan Terpercaya di Pontianak',
                'hero_description' => 'Pusat jual beli laptop second berkualitas dan jasa servis profesional di Pontianak. Dapatkan performa terbaik dengan harga yang bersahabat.',
                'address' => 'Jl. Sepakat 2 No 79, Pontianak, Kalimantan Barat',
                'phone' => '+62 821-5485-3612',
                'whatsapp_url' => 'https://wa.me/6282154853612',
                'open_hours' => 'Buka Setiap Hari (09.00 - 21.00 WIB)',
                'facebook_url' => 'https://facebook.com',
                'instagram_url' => 'https://instagram.com',
                'tiktok_url' => 'https://tiktok.com',
                'youtube_url' => 'https://youtube.com',
                'slider_images' => [],
                'services' => [
                    [
                        'id' => 1,
                        'title' => 'Servis Hardware & Software',
                        'description' => 'Mati total, ganti LCD, keyboard, hingga instalasi ulang OS dan aplikasi pendukung dengan pengerjaan transparan.',
                        'icon' => 'Wrench'
                    ],
                    [
                        'id' => 2,
                        'title' => 'Tukar Tambah',
                        'description' => 'Upgrade laptop lama Anda ke spesifikasi yang lebih tinggi dengan sistem tukar tambah yang adil dan menguntungkan.',
                        'icon' => 'RefreshCw'
                    ],
                    [
                        'id' => 3,
                        'title' => 'Jual Beli Laptop Second',
                        'description' => 'Unit laptop second pilihan, sudah melalui serangkaian Quality Control ketat dan didukung garansi toko resmi.',
                        'icon' => 'ShieldCheck'
                    ]
                ],
                'features' => [
                    [
                        'title' => 'Teknisi Berpengalaman',
                        'description' => 'Ditangani langsung oleh ahli tersertifikasi.',
                        'icon' => 'CheckCircle2'
                    ],
                    [
                        'title' => 'Sparepart Original',
                        'description' => 'Suku cadang berkualitas & bergaransi.',
                        'icon' => 'ShieldCheck'
                    ],
                    [
                        'title' => 'Harga Transparan',
                        'description' => 'Tanpa biaya tersembunyi di awal.',
                        'icon' => 'Tag'
                    ],
                    [
                        'title' => 'Garansi Servis',
                        'description' => 'Kepuasan terjamin dengan purna jual.',
                        'icon' => 'Award'
                    ]
                ]
            ]
        );
    }
}
