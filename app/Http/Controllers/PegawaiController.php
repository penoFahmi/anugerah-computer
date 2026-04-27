<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class PegawaiController extends Controller
{
    public function index(Request $request)
    {
        // Ambil data pegawai dengan pencarian sederhana
        $pegawais = User::role('pegawai')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('pegawai/list', [
            'pegawais' => $pegawais,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_number' => 'required|string|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole('pegawai');

        return redirect()->back()->with('flash', [
            'toast' => [
                'type' => 'success',
                'message' => 'El Halcón baru berhasil didaftarkan ke sistem!'
            ]
        ]);
    }

    public function update(Request $request, User $pegawai)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$pegawai->id,
            'phone_number' => 'required|string|max:255|unique:users,phone_number,'.$pegawai->id
        ]);

        $pegawai->update($request->only('name', 'email', 'phone_number'));

        return redirect()->back()->with('flash', [
            'toast' => [
                'type' => 'info',
                'message' => "Data {$pegawai->name} telah diperbarui."
            ]
        ]);
    }

    public function destroy(User $pegawai)
    {
        $nama = $pegawai->name;
        $pegawai->delete();

        return redirect()->back()->with('flash', [
            'toast' => [
                'type' => 'error',
                'message' => "{$nama} telah dihapus dari sistem."
            ]
        ]);
    }
}