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
        // Gunakan firstOrCreate untuk memastikan tidak ada duplikasi role jika seeder dijalankan lebih dari sekali
        $administratorRole = Role::firstOrCreate(['name' => 'administrator']);
        $teknisiRole = Role::firstOrCreate(['name' => 'teknisi']);
        $pegawaiRole = Role::firstOrCreate(['name' => 'pegawai']);

        // Data dummy untuk administrator
        $administrator = User::firstOrCreate(
            ['email' => 'administrator@anugerah.com'],
            [
                'name' => 'Peno',
                'phone_number' => '081234567890',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $administrator->assignRole($administratorRole);

        // Data dummy untuk teknisi
        $teknisi = User::firstOrCreate(
            ['email' => 'teknisi@anugerah.com'],
            [
                'name' => 'Putra Hermanto',
                'phone_number' => '081234567891',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $teknisi->assignRole($teknisiRole);

        // Data dummy untuk pegawai/kasir
        $pegawai = User::firstOrCreate(
            ['email' => 'pegawai@anugerah.com'],
            [
                'name' => 'Gita',
                'phone_number' => '081234567892',
                'password' => Hash::make('password'),
                'is_active' => false,
            ]
        );
        $pegawai->assignRole($pegawaiRole);;
    }
}
