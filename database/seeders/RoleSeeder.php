<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Gunakan firstOrCreate agar tidak error jika dijalankan ulang
        $administratorRole = Role::firstOrCreate(['name' => 'administrator']);
        $teknisiRole = Role::firstOrCreate(['name' => 'teknisi']);
        $pegawaiRole = Role::firstOrCreate(['name' => 'pegawai']);

        // Buat Administrator
        $administrator = User::firstOrCreate(
            ['email' => 'admin@anugerah.com'],
            [
                'name' => 'Peno Admin',
                'phone_number' => '081234567890',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $administrator->assignRole($administratorRole);

        // 3. Buat Akun Teknisi
        $teknisi = User::create([
            'name' => 'Budi Teknisi',
            'email' => 'teknisi@anugerah.com',
            'password' => Hash::make('password'),
        ]);
        $teknisi->assignRole($teknisiRole);
    }
}
