<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $administratorRole = Role::where('name', 'administrator')->first();
        $teknisiRole = Role::where('name', 'teknisi')->first();
        $pegawaiRole = Role::where('name', 'pegawai')->first();

        // Data awal untuk administrator
        $administrator = User::factory()->create([
            'name' => 'Peno',
            'email' => 'penofahmi@gmail.com',
            'phone_number' => '081234567890',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        if ($administratorRole) $administrator->assignRole($administratorRole);

        // Data awal untuk teknisi
        $teknisi = User::factory()->create([
            'name' => 'Putra Hermanto',
            'email' => 'teknisi@anugerah.com',
            'phone_number' => '081234567891',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        if ($teknisiRole) $teknisi->assignRole($teknisiRole);

        // Data awal untuk pegawai/kasir
        $pegawai = User::factory()->create([
            'name' => 'Gita',
            'email' => 'pegawai@anugerah.com',
            'phone_number' => '081234567892',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        if ($pegawaiRole) $pegawai->assignRole($pegawaiRole);

        $pegawai2 = User::factory()->create([
            'name' => 'Dewi',
            'email' => 'pegawai2@anugerah.com',
            'phone_number' => '081234567893',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        if ($pegawaiRole) $pegawai2->assignRole($pegawaiRole);

        $pegawai3 = User::factory()->create([
            'name' => 'Rizky',
            'email' => 'pegawai3@anugerah.com',
            'phone_number' => '081234567894',
            'password' => Hash::make('password'),
            'is_active' => false,
        ]);
        if ($pegawaiRole) $pegawai3->assignRole($pegawaiRole);
    }
}
