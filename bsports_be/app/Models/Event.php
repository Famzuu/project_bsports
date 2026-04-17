<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'nama_event',
        'tipe_lomba',
        'target_jarak',
        'deskripsi',       // Tambahan
        'image_url',       // Tambahan
        'status',          // Tambahan
        'jadwal_start',
        'jadwal_selesai',
        'waktu_start_live',
        'status_aktif',
    ];

    // Relasi ke peserta event
    public function participants()
    {
        return $this->hasMany(EventParticipant::class);
    }
}