<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        Event::create([
            'nama_event' => 'B-Sports Jakarta Marathon 2026',
            'tipe_lomba' => 'live',
            'target_jarak' => 10.00,
            'deskripsi' => 'Lari massal 10KM keliling rute Sudirman-Thamrin. Siapkan dirimu untuk menjadi yang pertama di garis finish!',
            'image_url' => 'https://images.unsplash.com/photo-1552674605-15c37042ce88?q=80&w=1000&auto=format&fit=crop',
            'status' => 'upcoming',
            'jadwal_start' => Carbon::now()->addDays(2)->setTime(6, 0, 0), // Mulai 2 hari lagi jam 6 pagi
            'jadwal_selesai' => Carbon::now()->addDays(2)->setTime(12, 0, 0),
            'waktu_start_live' => Carbon::now()->addDays(2)->setTime(6, 0, 0),
            'status_aktif' => true,
        ]);

        Event::create([
            'nama_event' => 'Virtual Run: Menembus Batas 25K',
            'tipe_lomba' => 'virtual',
            'target_jarak' => 25.00,
            'deskripsi' => 'Taklukkan jarak 25KM di mana saja dan kapan saja selama periode event berlangsung. Kumpulkan kilometer pertamamu hari ini.',
            'image_url' => 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1000&auto=format&fit=crop',
            'status' => 'ongoing',
            'jadwal_start' => Carbon::now()->subDays(1), // Sudah mulai dari kemarin
            'jadwal_selesai' => Carbon::now()->addDays(14), // Berakhir 14 hari lagi
            'waktu_start_live' => null, // Karena virtual, tidak ada jam start serentak
            'status_aktif' => true,
        ]);
    }
}