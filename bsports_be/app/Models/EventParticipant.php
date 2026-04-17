<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventParticipant extends Model
{
    // Mengizinkan pengisian data massal
    protected $fillable = [
        'user_id',
        'event_id',
        'status_approval',
        'jarak_ditempuh',       // Tambahan baru
        'waktu_tempuh_detik',   // Tambahan baru
        'waktu_selesai',        // Tambahan baru
        'is_finished',          // Tambahan baru
    ];

    // Relasi ke tabel User (Siapa yang daftar)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke tabel Event (Lomba apa yang diikuti)
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}