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
        // 1. Buat Role
        $adminRole = Role::create(['name' => 'admin']);
        $teknisiRole = Role::create(['name' => 'teknisi']);
        $teknisiRole = Role::create(['name' => 'pegawai']);

        // 2. Buat Akun Super Admin (Pemilik)
        $admin = User::create([
            'name' => 'Peno Admin',
            'email' => 'admin@anugerah.com',
            'phone_number' => '081234567890',
            'password' => Hash::make('password'), // password default
        ]);
        $admin->assignRole($adminRole);

        // 3. Buat Akun Teknisi
        $teknisi = User::create([
            'name' => 'Budi Teknisi',
            'email' => 'teknisi@anugerah.com',
            'password' => Hash::make('password'),
        ]);
        $teknisi->assignRole($teknisiRole);
    }
}