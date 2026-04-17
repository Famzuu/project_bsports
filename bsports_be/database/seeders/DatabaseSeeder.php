<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Jabatan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Data Jabatan Dulu
        Jabatan::create(['nama_jabatan' => 'Superadmin', 'status_aktif' => true]); // Mendapat ID 1
        Jabatan::create(['nama_jabatan' => 'User', 'status_aktif' => true]);       // Mendapat ID 2

        // 2. Buat Akun Super Admin dengan jabatan_id = 1
        User::create([
            'name' => 'Super Admin BSports',
            'email' => 'admin@bsports.com',
            'password' => Hash::make('admin123'),
            'jabatan_id' => 1, 
            'no_hp' => '081234567890',
            'unit_kerja' => 'Pusat',
            'alamat' => 'Kantor B-Sports Pusat',
        ]);
    }
}