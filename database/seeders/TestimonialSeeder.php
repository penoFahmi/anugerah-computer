<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Testimonial::insert([
            [
                'name' => 'Budi Santoso',
                'role' => 'Mahasiswa UNTAN',
                'text' => 'Pelayanan sangat ramah dan cepat. Laptop saya yang mati total bisa hidup kembali dalam waktu 2 hari. Mantap Anugerah Computer!',
                'rating' => 5,
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siti Aminah',
                'role' => 'Pekerja Swasta',
                'text' => 'Beli laptop second di sini sangat memuaskan. Kualitas barang masih mulus seperti baru dan ada garansi tokonya. Recommended banget.',
                'rating' => 5,
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Reza Fahlevi',
                'role' => 'Gamer',
                'text' => 'Tukar tambah laptop lama dengan laptop gaming di sini harganya sangat bersahabat. Prosesnya cepat dan tidak ribet.',
                'rating' => 5,
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
