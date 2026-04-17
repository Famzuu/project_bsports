<?php

namespace App\Http\Controllers;

use App\Models\EventParticipant;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EventParticipantController extends Controller
{
    // USER: Join Event
    // USER: Join Event
    public function joinEvent(Request $request)
    {
        $request->validate(['event_id' => 'required|exists:events,id']);
        $user_id = $request->user()->id;
        $event_id = $request->event_id;

        $event = Event::find($event_id);
        
        // Cek apakah event masih bisa didaftar
        if (!$event->status_aktif || \Carbon\Carbon::now()->greaterThan($event->jadwal_selesai)) {
            return response()->json(['message' => 'Maaf, event ini sudah ditutup.'], 400);
        }

        $existing = EventParticipant::where('user_id', $user_id)->where('event_id', $event_id)->first();
        
        if ($existing) {
            // Jika sebelumnya batal, aktifkan kembali
            if ($existing->status_approval === 'cancelled') {
                $existing->update(['status_approval' => 'pending']);
                return response()->json(['message' => 'Berhasil bergabung kembali! Menunggu persetujuan Admin.']);
            }
            
            // 👇 TAMBAHAN LOGIKA PENGECEKAN STATUS 👇
            if ($existing->status_approval === 'rejected') {
                return response()->json(['message' => 'Maaf, pendaftaran Anda untuk event ini telah ditolak oleh Admin.'], 400);
            }

            if ($existing->status_approval === 'approved') {
                return response()->json(['message' => 'Anda sudah terdaftar dan disetujui untuk mengikuti event ini.'], 400);
            }

            // Jika statusnya masih 'pending'
            return response()->json(['message' => 'Pendaftaran Anda sedang diproses. Mohon tunggu persetujuan Admin.'], 400);
        }

        // Jika belum pernah daftar sama sekali
        $participant = EventParticipant::create([
            'user_id' => $user_id,
            'event_id' => $event_id,
            'status_approval' => 'pending'
        ]);

        return response()->json(['message' => 'Berhasil mendaftar Lomba! Menunggu persetujuan Admin.', 'data' => $participant], 201);
    }
    
    // USER: Batal Ikut Event (Tidak dihapus agar history tidak hilang)
    public function cancelEvent(Request $request)
    {
        $request->validate(['event_id' => 'required|exists:events,id']);
        
        $participant = EventParticipant::where('user_id', $request->user()->id)
                                       ->where('event_id', $request->event_id)
                                       ->first();

        if (!$participant) {
            return response()->json(['message' => 'Anda tidak terdaftar di event ini.'], 404);
        }

        // Ubah status menjadi cancelled, bukan di-delete
        $participant->update(['status_approval' => 'cancelled']);

        return response()->json(['message' => 'Berhasil membatalkan partisipasi event.']);
    }

    // SUPER ADMIN: Masukkan peserta by Email
    public function addByEmail(Request $request)
    {
        if ($request->user()->jabatan_id !== 1) {
            return response()->json(['message' => 'Akses ditolak!'], 403);
        }

        $request->validate([
            'email' => 'required|email|exists:users,email',
            'event_id' => 'required|exists:events,id'
        ]);

        $userTarget = User::where('email', $request->email)->first();

        $existing = EventParticipant::where('user_id', $userTarget->id)->where('event_id', $request->event_id)->first();
        if ($existing) {
            return response()->json(['message' => 'User dengan email tersebut sudah ada di event ini.'], 400);
        }

        $participant = EventParticipant::create([
            'user_id' => $userTarget->id,
            'event_id' => $request->event_id,
            'status_approval' => 'approved' // Jika admin yang masukin, otomatis langsung approved
        ]);

        return response()->json(['message' => "User {$userTarget->name} berhasil ditambahkan ke event!", 'data' => $participant]);
    }

    // SUPER ADMIN: Approve/Reject Peserta (Bisa massal)
    public function updateStatus(Request $request)
    {
        if ($request->user()->jabatan_id !== 1) {
            return response()->json(['message' => 'Akses ditolak!'], 403);
        }

        $request->validate([
            'participant_ids' => 'required|array',
            'participant_ids.*' => 'exists:event_participants,id',
            'status_approval' => 'required|in:approved,rejected,pending'
        ]);

        EventParticipant::whereIn('id', $request->participant_ids)
                        ->update(['status_approval' => $request->status_approval]);

        return response()->json(['message' => 'Status persetujuan peserta berhasil diperbarui!']);
    }

    // SUPER ADMIN: Melihat daftar peserta suatu event
    public function getParticipants(Request $request, $eventId)
    {
        // Pengecekan apakah yang akses adalah Super Admin (jabatan_id === 1)
        if ($request->user()->jabatan_id !== 1) {
            return response()->json(['message' => 'Akses ditolak!'], 403);
        }

        // AMBIL SEMUA DATA (Pending, Approved, Rejected) BESERTA RELASI USER
        $participants = EventParticipant::with('user')
                            ->where('event_id', $eventId)
                            ->orderBy('created_at', 'desc')
                            ->get();

        return response()->json([
            'message' => 'Berhasil mengambil daftar peserta',
            'data' => $participants
        ]);
    }
}