<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;

class CustomerController extends Controller
{
    /**
     * Menampilkan daftar pelanggan dengan filter, paginasi aman, dan data analitik ringan.
     */
    public function index(Request $request): Response
    {
        // 1. Keamanan & Performa: Kunci maksimal pagination di angka 100
        $validatedLimit = (int) $request->input('per_page', 10);
        $limit = ($validatedLimit > 100 || $validatedLimit < 1) ? 10 : $validatedLimit;

        $customers = Customer::query()
            // 2. Performa: Mengambil total servis tanpa memuat seluruh data relasinya
            ->withCount('serviceOrders')
            // 3. Tambahan Analitik: Mengambil tanggal transaksi terakhir secara efisien di level database
            ->withMax('serviceOrders', 'created_at')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($limit)
            ->withQueryString()
            ->through(fn ($customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                // Pastikan alamat tidak null di UI, berikan nilai default (fallback)
                'address' => $customer->address ?? '-',
                'service_orders_count' => $customer->service_orders_count,
                // Format tanggal langsung di backend agar frontend tinggal menampilkan
                'last_service_date' => $customer->service_orders_max_created_at 
                    ? Carbon::parse($customer->service_orders_max_created_at)->translatedFormat('d M Y') 
                    : 'Belum ada servis',
            ]);

        return Inertia::render('customers/list', [
            'customers' => $customers,
            'filters' => [
                'search' => $request->input('search', ''),
                'per_page' => (string) $limit,
            ],
        ]);
    }

    /**
     * Menghapus (Soft Delete) data pelanggan secara aman.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        // Catatan: Jika menggunakan Policy di masa depan, gunakan Gate::authorize() di sini
        // Gate::authorize('delete', $customer);

        $customer->delete();

        // 4. Standar Inertia Flash Message yang telah disepakati
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pelanggan {$customer->name} berhasil dihapus."
        ]);

        return back();
    }
}