<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class PegawaiController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('pegawai/list', [
            'pegawais' => User::role('pegawai')
                ->when($request->search, fn($q, $search) => 
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                )
                ->when($request->filled('status'), fn($q) => 
                    $q->where('is_active', $request->status)
                )
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $input = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            ...$input,
            'password' => Hash::make($input['password']),
            'is_active' => true,
        ]);

        $user->assignRole('pegawai');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Pegawai berhasil ditambahkan.')]);

        return back();
    }

    public function update(Request $request, User $pegawai)
    {
        $input = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,'.$pegawai->id],
            'phone_number' => ['nullable', 'string'],
        ]);

        $pegawai->update($input);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Pegawai berhasil diupdate.')]);

        return back();
    }

    public function destroy(User $pegawai)
    {
        $pegawai->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Pegawai berhasil dihapus.')]);
        
        return back();
    }

    public function toggleStatus(User $pegawai)
    {
        $pegawai->update(['is_active' => !$pegawai->is_active]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status Pegawai berhasil diubah.')]);

        return back();
    }
}