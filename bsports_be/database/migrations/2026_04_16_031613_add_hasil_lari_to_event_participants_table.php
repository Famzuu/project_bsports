<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('event_participants', function (Blueprint $table) {
            // Jarak yang saat ini sedang/sudah ditempuh peserta
            $table->decimal('jarak_ditempuh', 8, 2)->default(0)->after('status_approval')->comment('Jarak dalam KM');
            
            // Penentu Juara Lomba Virtual (Siapa yang durasi larinya paling cepat)
            $table->integer('waktu_tempuh_detik')->nullable()->after('jarak_ditempuh')->comment('Total durasi lari');
            
            // Penentu Juara Lomba Live (Siapa yang jam finish-nya paling awal)
            $table->dateTime('waktu_selesai')->nullable()->after('waktu_tempuh_detik')->comment('Kapan peserta mencapai finish');
            
            // Status apakah peserta sudah menyelesaikan target lomba
            $table->boolean('is_finished')->default(false)->after('waktu_selesai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_participants', function (Blueprint $table) {
            $table->dropColumn([
                'jarak_ditempuh',
                'waktu_tempuh_detik',
                'waktu_selesai',
                'is_finished'
            ]);
        });
    }
};