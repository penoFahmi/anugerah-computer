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
        Role::firstOrCreate(['name' => 'administrator']);
        Role::firstOrCreate(['name' => 'teknisi']);
        Role::firstOrCreate(['name' => 'pegawai']);
    }
}
