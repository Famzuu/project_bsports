<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jabatan extends Model
{
    protected $fillable = ['nama_jabatan', 'status_aktif'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
