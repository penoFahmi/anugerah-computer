<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class TrashController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $typeFilter = $request->input('type', 'all');
        $perPage = $request->input('per_page', '5');
        $limit = $perPage === 'all' ? 1000 : (int) $perPage;

        $trashItems = collect();

        // 1. Kumpulkan Sampah: Pegawai (User)
        if ($typeFilter === 'all' || $typeFilter === 'pegawai') {
            $usersQuery = User::onlyTrashed();

            if ($search) {
                $usersQuery->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $usersQuery->get()->map(function ($user) {
                return [
                    'id' => $user->id,
                    'type' => 'pegawai',
                    'category_label' => 'Pegawai',
                    'data_info' => $user->name . ' (' . $user->email . ')',
                    'deleted_timestamp' => $user->deleted_at, // Untuk sorting akurat
                    'deleted_at' => $user->deleted_at->format('d M Y, H:i'),
                ];
            });
            $trashItems = $trashItems->merge($users);
        }

        // Nanti tambahkan $customersQuery, $servicesQuery di sini dengan pola yang sama...

        // 2. Sorting Global (Terbaru dihapus di atas)
        $trashItems = $trashItems->sortByDesc('deleted_timestamp')->values();

        // 3. Manual Pagination untuk Collection
        $page = Paginator::resolveCurrentPage() ?: 1;
        $paginatedItems = new LengthAwarePaginator(
            $trashItems->forPage($page, $limit)->values(),
            $trashItems->count(),
            $limit,
            $page,
            ['path' => Paginator::resolveCurrentPath(), 'query' => $request->query()]
        );

        return Inertia::render('sampah/list', [
            'trashItems' => $paginatedItems,
            'filters' => [
                'search' => $search ?? '',
                'type' => $typeFilter,
                'per_page' => $perPage,
            ]
        ]);
    }

    public function restore(Request $request, $type, $id)
    {
        // Logika Universal: Cek tipe data apa yang mau dipulihkan
        if ($type === 'pegawai') {
            $record = User::onlyTrashed()->findOrFail($id);

            // Proteksi: Cek apakah email sudah dipakai oleh pegawai baru
            if (User::where('email', $record->email)->exists()) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Gagal memulihkan! Email pegawai ini sudah digunakan oleh akun lain yang aktif.'
                ]);
                return back();
            }

            $record->restore();
            $message = 'Data Pegawai berhasil dipulihkan.';
        }
        // else if ($type === 'servis') { ... } 

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message ?? 'Data berhasil dipulihkan.'
        ]);

        return back();
    }

    public function forceDelete(Request $request, $type, $id)
    {
        // Logika Universal: Cek tipe data apa yang mau dihapus permanen
        if ($type === 'pegawai') {
            $record = User::onlyTrashed()->findOrFail($id);
            $record->forceDelete();
            $message = 'Data Pegawai dihapus secara permanen.';
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message ?? 'Data berhasil dihapus permanen.'
        ]);

        return back();
    }
}
