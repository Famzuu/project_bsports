<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EventController extends Controller
{
    // READ: Melihat daftar Event
    // READ: Melihat daftar Event
    public function index(Request $request)
    {
        $user = $request->user();

        // Fungsi untuk melampirkan status pendaftaran user yang sedang login
        $withParticipantStatus = ['participants' => function ($query) use ($user) {
            $query->where('user_id', $user->id);
        }];

        if ($user->jabatan_id === 1) {
            // SUPER ADMIN: Tetap lihat semua event, TAPI status pendaftaran pribadinya ikut dilampirkan
            $events = Event::with($withParticipantStatus)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // USER BIASA: Hanya lihat event aktif & belum lewat waktu, beserta status pendaftarannya
            $events = Event::with($withParticipantStatus)
                ->where('status_aktif', true)
                ->where('jadwal_selesai', '>', Carbon::now())
                ->orderBy('jadwal_start', 'asc')
                ->get();
        }

        return response()->json([
            'message' => 'Berhasil mengambil data event',
            'data' => $events
        ]);
    }
    // CREATE: Membuat Event (Hanya Admin)
    public function store(Request $request)
    {
        if ($request->user()->jabatan_id !== 1) {
            return response()->json(['message' => 'Akses ditolak!'], 403);
        }

        $validatedData = $request->validate([
            'nama_event' => 'required|string|max:255',
            'tipe_lomba' => 'required|in:virtual,live',
            'target_jarak' => 'required|numeric',
            'deskripsi' => 'nullable|string',
            'image_url' => 'nullable|string',
            'status' => 'required|in:upcoming,ongoing,completed',
            'jadwal_start' => 'required|date',
            'jadwal_selesai' => 'required|date|after:jadwal_start',
            'waktu_start_live' => 'nullable|date',
            'status_aktif' => 'boolean'
        ]);

        $event = Event::create($validatedData);

        return response()->json(['message' => 'Event berhasil dibuat!', 'data' => $event], 201);
    }

    // UPDATE: Edit Event (Hanya Admin)
    public function update(Request $request, $id)
    {
        if ($request->user()->jabatan_id !== 1) {
            return response()->json(['message' => 'Akses ditolak!'], 403);
        }

        $event = Event::find($id);
        if (!$event)
            return response()->json(['message' => 'Event tidak ditemukan'], 404);

        $event->update($request->all());

        return response()->json(['message' => 'Event berhasil diupdate!', 'data' => $event]);
    }

    // DELETE: Hapus Event (Hanya Admin)
    // DELETE: Hapus Event (Hanya Admin)
    public function destroy(Request $request, $id)
    {
        if ($request->user()->jabatan_id !== 1) {
            return response()->json(['message' => 'Akses ditolak!'], 403);
        }

        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        try {
            // PENTING: Hapus semua peserta yang terkait dengan event ini dulu
            // Pastikan Anda sudah mengimport model EventParticipant di atas file jika diperlukan
            // use App\Models\EventParticipant;
            \App\Models\EventParticipant::where('event_id', $id)->delete();

            // Setelah pesertanya bersih, baru hapus Event-nya
            $event->delete();

            return response()->json(['message' => 'Event beserta pesertanya berhasil dihapus!']);
        } catch (\Exception $e) {
            // Tangkap error database jika masih ada masalah
            return response()->json(['message' => 'Gagal menghapus: ' . $e->getMessage()], 500);
        }
    }
}