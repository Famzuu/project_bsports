<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Fungsi untuk Mendaftar
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => explode('@', $validatedData['email'])[0], // ✅ auto isi dari email
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'jabatan_id' => 2, // pastikan ini ada di tabel jabatan
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Berhasil mendaftar!',
            'access_token' => $token,
            'user' => $user
        ], 201);
    }

    // Fungsi untuk Masuk
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        // Cek apakah email ada dan password cocok
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau Password salah'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Berhasil login!',
            'access_token' => $token,
            'user' => $user
        ]);
    }
}
