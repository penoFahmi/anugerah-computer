<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CustomerController extends Controller
{
    /**
     * Menampilkan daftar pelanggan dengan filter dan paginasi yang aman.
     */
    public function index(Request $request): Response
    {
        // 1. Keamanan & Performa: Kunci maksimal pagination di angka 100
        $validatedLimit = (int) $request->input('per_page', 10);
        $limit = ($validatedLimit > 100 || $validatedLimit < 1) ? 10 : $validatedLimit;

        $customers = Customer::query()
            // 2. Performa: Gunakan withCount untuk efisiensi jika hanya butuh total servis
            ->withCount('serviceOrders')
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
                'service_orders_count' => $customer->service_orders_count, // Data ringan, sangat berguna untuk UI
            ]);

        // Catatan: ServiceOrder::all() DIHAPUS karena merusak RAM server.

        return Inertia::render('customers/list', [
            'customers' => $customers,
            'filters' => [
                'search' => $request->input('search', ''),
                'per_page' => $limit,
            ],
        ]);
    }

    /**
     * Menghapus (Soft Delete) data pelanggan secara aman.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        // 3. Keamanan Ekstrem: Pastikan hanya peran yang berhak yang bisa menghapus (opsional/disesuaikan dengan policy)
        // Gate::authorize('delete', $customer);

        $customer->delete();

        // 4. Standar Inertia Flash Message: Kirim melalui session redirect
        return back()->with('toast', [
            'type' => 'success',
            'message' => "Pelanggan {$customer->name} berhasil dihapus."
        ]);
    }
}