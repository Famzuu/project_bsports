<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController; // Pastikan ini di-import
use App\Http\Controllers\EventParticipantController;

// Route Terbuka (Siapapun bisa akses tanpa login)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route Tertutup (HANYA bisa diakses jika user menyertakan Token Login di Headernya)
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Illuminate\Http\Request $request) {
    return $request->user()->fresh(); // 🔥 PENTING
});
    
    // Rute untuk Event
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);

    // rute delete event
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    // Rute untuk Peserta
    Route::post('/events/join', [EventParticipantController::class, 'joinEvent']); // User mendaftar
    
    // Rute Khusus Admin: Update Status Peserta
    Route::put('/events/participants/status', [EventParticipantController::class, 'updateStatus']);

    // Rute untuk mengambil daftar peserta berdasarkan ID Event
    Route::get('/events/{eventId}/participants', [EventParticipantController::class, 'getParticipants']);
    
});
