<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('events', function (Blueprint $table) {
            // Kolom Sistem Perlombaan
            $table->enum('tipe_lomba', ['virtual', 'live'])->default('virtual')->after('nama_event');
            $table->decimal('target_jarak', 8, 2)->default(0)->after('tipe_lomba');
            
            // Kolom Informasi & Tampilan UI
            $table->text('deskripsi')->nullable()->after('target_jarak');
            $table->string('image_url')->nullable()->after('deskripsi');
            $table->enum('status', ['upcoming', 'ongoing', 'completed'])->default('upcoming')->after('image_url');
            
            // Kolom Waktu Khusus Live
            $table->dateTime('waktu_start_live')->nullable()->after('jadwal_selesai')->comment('Khusus tipe live/mass start');
        });
    }

    public function down()
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'tipe_lomba', 'target_jarak', 'deskripsi',
                'image_url', 'status', 'waktu_start_live'
            ]);
        });
    }
};
