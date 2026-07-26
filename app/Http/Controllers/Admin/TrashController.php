<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Customer;
use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;

class TrashController extends Controller
{
    /**
     * Menampilkan daftar semua data yang dihapus (Soft Deletes).
     * Menggabungkan Pegawai, Pelanggan, dan Pesanan Servis ke dalam satu koleksi paginasi.
     */
    public function index(Request $request): Response
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
                    'deleted_timestamp' => $user->deleted_at, // Dipertahankan untuk kebutuhan sorting
                    'deleted_at' => $user->deleted_at->format('d M Y, H:i'),
                ];
            });
            $trashItems = $trashItems->merge($users);
        }

        // 2. Kumpulkan Sampah: Pelanggan (Customer)
        if ($typeFilter === 'all' || $typeFilter === 'customer') {
            $customerQuery = Customer::onlyTrashed();
            
            if ($search) {
                $customerQuery->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            $customers = $customerQuery->get()->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'type' => 'customer',
                    'category_label' => 'Pelanggan',
                    'data_info' => $customer->name . ' (' . $customer->phone . ')',
                    'deleted_timestamp' => $customer->deleted_at,
                    'deleted_at' => $customer->deleted_at->format('d M Y, H:i'),
                ];
            });
            $trashItems = $trashItems->merge($customers);
        }

        // 3. Kumpulkan Sampah: Pesanan Servis (Service Order)
        if ($typeFilter === 'all' || $typeFilter === 'servis') {
            // OPTIMASI: Eager loading customer (termasuk yang di-trash) untuk mencegah N+1 Query Issue
            $serviceQuery = ServiceOrder::onlyTrashed()
                ->with(['customer' => fn($q) => $q->withTrashed()]);

            if ($search) {
                $serviceQuery->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('customer', function($qCust) use ($search) {
                          $qCust->where('name', 'like', "%{$search}%");
                      });
                });
            }

            $services = $serviceQuery->get()->map(function ($service) {
                return [
                    'id' => $service->id,
                    'type' => 'servis',
                    'category_label' => 'Servis',
                    'data_info' => $service->order_number . ' (' . ($service->customer->name ?? 'N/A') . ')',
                    'deleted_timestamp' => $service->deleted_at,
                    'deleted_at' => $service->deleted_at->format('d M Y, H:i'),
                ];
            });
            $trashItems = $trashItems->merge($services);
        }

        // 4. Sorting Global (Data yang paling baru dihapus berada di paling atas)
        $trashItems = $trashItems->sortByDesc('deleted_timestamp')->values();

        // 5. Manual Pagination untuk Laravel Collection
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

    /**
     * Memulihkan data dari tempat sampah berdasarkan tipe entitasnya.
     */
    public function restore(Request $request, string $type, string|int $id): RedirectResponse
    {
        $message = '';

        switch ($type) {
            case 'pegawai':
                $record = User::onlyTrashed()->findOrFail($id);

                // Proteksi: Mencegah pemulihan jika email sudah didaur ulang untuk akun baru
                if (User::where('email', $record->email)->exists()) {
                    Inertia::flash('toast', [
                        'type' => 'error',
                        'message' => 'Gagal memulihkan! Email Pegawai ini sudah digunakan oleh akun lain yang aktif.'
                    ]);
                    return back();
                }

                $record->restore();
                $message = 'Data Pegawai berhasil dipulihkan.';
                break;

            case 'customer':
                $record = Customer::onlyTrashed()->findOrFail($id);
                
                // Proteksi: Mencegah pemulihan jika nomor telepon sudah didaur ulang
                if (Customer::where('phone', $record->phone)->exists()) {
                    Inertia::flash('toast', [
                        'type' => 'error', 
                        'message' => 'Gagal memulihkan! Nomor WhatsApp ini sudah dipakai oleh pelanggan lain yang aktif.'
                    ]);
                    return back();
                }
                
                $record->restore();
                $message = 'Data Pelanggan berhasil dipulihkan.';
                break;

            case 'servis':
                $record = ServiceOrder::onlyTrashed()->findOrFail($id);
                $record->restore();
                $message = 'Data Pesanan Servis berhasil dipulihkan.';
                break;

            default:
                abort(404, 'Tipe data tidak dikenali sistem.');
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message
        ]);

        return back();
    }

    /**
     * Menghapus data secara permanen dari basis data (Force Delete).
     */
    public function forceDelete(Request $request, string $type, string|int $id): RedirectResponse
    {
        $message = '';

        switch ($type) {
            case 'pegawai':
                $record = User::onlyTrashed()->findOrFail($id);
                $record->forceDelete();
                $message = 'Data Pegawai telah dihapus secara permanen.';
                break;

            case 'customer':
                $record = Customer::onlyTrashed()->findOrFail($id);
                // Relasi perangkat (devices) harus dikonfigurasi cascade jika ingin ikut terhapus,
                // atau dihapus manual di sini jika menggunakan restrict.
                $record->forceDelete();
                $message = 'Data Pelanggan telah dihapus secara permanen.';
                break;

            case 'servis':
                $record = ServiceOrder::onlyTrashed()->findOrFail($id);
                $record->forceDelete();
                $message = 'Data Pesanan Servis telah dihapus secara permanen.';
                break;

            default:
                abort(404, 'Tipe data tidak dikenali sistem.');
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message
        ]);

        return back();
    }
}

