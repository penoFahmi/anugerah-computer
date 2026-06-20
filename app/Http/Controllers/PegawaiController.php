<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class PegawaiController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 5);
        $limit = $perPage === 'all' ? 1000 : (int) $perPage;

        $pegawais = User::with('roles')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status') && $request->status !== 'all', function ($query) use ($request) {
                $status = $request->status === 'active';
                $query->where('is_active', $status);
            })
            ->when($request->filled('role') && $request->role !== 'all', function ($query) use ($request) {
                $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('name', $request->role);
                });
            })
            ->latest()
            ->paginate($limit)
            ->withQueryString()
            ->through(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'is_active' => $user->is_active,
                'role' => $user->roles->first()?->name ?? '-',
            ]);

        $roles = Role::whereIn('name', ['administrator', 'teknisi', 'pegawai'])->get(['id', 'name']);

        return Inertia::render('pegawai/list', [
            'pegawais' => $pegawais,
            'roles' => $roles,
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? 'all',
                'role' => $request->role ?? 'all',
                'per_page' => $request->per_page ?? '5',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $input = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone_number' => ['nullable', 'string', 'max:20', 'unique:users'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ],
        [
            'email.unique' => 'Email sudah digunakan. Silakan gunakan email lain.',
            'phone_number.unique' => 'Nomor WhatsApp sudah digunakan. Silakan gunakan nomor lain.',
            'role.exists' => 'Role yang dipilih tidak valid. Silakan pilih role yang tersedia.'
        ]);

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone_number' => $input['phone_number'],
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);

        $user->assignRole($input['role']);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Pegawai berhasil didaftarkan. Password default: password'
        ]);

        return back();
    }

    public function update(Request $request, User $pegawai)
    {
        $input = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $pegawai->id],
            'phone_number' => ['nullable', 'string', 'max:20', 'unique:users,phone_number,' . $pegawai->id],
            'role' => ['required', 'string', 'exists:roles,name'],
        ], [
            'email.unique' => 'Email sudah digunakan. Silakan gunakan email lain.',
            'phone_number.unique' => 'Nomor WhatsApp sudah digunakan. Silakan gunakan nomor lain.',
            'role.exists' => 'Role yang dipilih tidak valid. Silakan pilih role yang tersedia.'
        ]);

        $pegawai->update([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone_number' => $input['phone_number'],
        ]);

        $pegawai->syncRoles($input['role']);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Data pegawai berhasil diperbarui.'
        ]);

        return back();
    }

    public function destroy(User $pegawai)
    {
        if ($pegawai->id === auth()->id()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Aksi ditolak! Anda tidak dapat menghapus akun Anda sendiri.'
            ]);
            return back();
        }

        $pegawai->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Pegawai berhasil dihapus.'
        ]);

        return back();
    }

    public function toggleStatus(User $pegawai)
    {
        if ($pegawai->id === auth()->id()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Aksi ditolak! Anda tidak dapat menonaktifkan akun Anda sendiri.'
            ]);
            return back();
        }

        $pegawai->update(['is_active' => !$pegawai->is_active]);
        $status = $pegawai->is_active ? 'diaktifkan' : 'dinonaktifkan';

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pegawai berhasil {$status}."
        ]);

        return back();
    }

    public function resetPassword(User $pegawai)
    {
        $pegawai->update([
            'password' => Hash::make('password')
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Password {$pegawai->name} berhasil di-reset menjadi: password"
        ]);

        return back();
    }
}
