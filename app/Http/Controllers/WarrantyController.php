<?php

namespace App\Http\Controllers;

use App\Models\Warranty;
use App\Models\ServiceOrder;
use App\Enums\ServiceStatus;
use App\Events\ServiceOrderCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class WarrantyController extends Controller
{
    /**
     * Menampilkan daftar garansi (Aktif, Hangus/Void, atau Kedaluwarsa).
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status', 'per_page']);
        $perPage = $filters['per_page'] ?? '10';

        // OPTIMASI: Eager load dengan withTrashed() agar riwayat garansi tidak error 
        // jika pelanggan atau perangkatnya sudah dimasukkan ke tempat sampah.
        $query = Warranty::with([
            'serviceOrder.customer' => fn($q) => $q->withTrashed(),
            'serviceOrder.device' => fn($q) => $q->withTrashed()
        ]);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('warranty_code', 'like', "%{$search}%")
                  ->orWhereHas('serviceOrder', function ($q) use ($search) {
                      $q->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($qc) use ($search) {
                            $qc->where('name', 'like', "%{$search}%")
                               ->orWhere('phone', 'like', "%{$search}%");
                        });
                  });
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'expired') {
                $query->where('end_date', '<', today())->where('status', 'active');
            } else {
                $query->where('status', $filters['status']);
                if ($filters['status'] === 'active') {
                    $query->where('end_date', '>=', today());
                }
            }
        }

        $limit = $perPage === 'all' ? 500 : (int) $perPage;
        
        $warranties = $query->latest()->paginate($limit)->withQueryString();

        $warranties->through(function ($w) {
            $isExpired = $w->end_date < today() && $w->status === 'active';
            $currentStatus = $isExpired ? 'expired' : $w->status;

            return [
                'id' => $w->id,
                'warranty_code' => $w->warranty_code,
                'order_number' => $w->serviceOrder->order_number ?? '-',
                'customer_name' => $w->serviceOrder->customer->name ?? 'N/A',
                'customer_phone' => $w->serviceOrder->customer->phone ?? '-',
                'device_name' => ($w->serviceOrder->device->brand ?? '') . ' ' . ($w->serviceOrder->device->model ?? ''),
                'start_date' => $w->start_date->format('d M Y'),
                'end_date' => $w->end_date->format('d M Y'),
                'status' => $currentStatus,
                'claim_count' => $w->claim_count,
                'notes' => $w->notes,
            ];
        });

        return Inertia::render('garansi/list', [
            'warranties' => $warranties,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
                'per_page' => $perPage,
            ]
        ]);
    }

    /**
     * Memperbarui status garansi (misalnya: dihanguskan secara manual/Void).
     */
    public function update(Request $request, Warranty $warranty): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:active,void'],
            'notes' => ['required', 'string', 'max:1000'],
        ]);

        $warranty->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Status garansi ' . $warranty->warranty_code . ' berhasil dihanguskan.'
        ]);

        return back();
    }

    /**
     * Memproses klaim garansi.
     * Akan menerbitkan pesanan servis (Service Order) baru dengan biaya Rp 0.
     */
    public function claim(Request $request, Warranty $warranty): RedirectResponse
    {
        $request->validate([
            'complaint' => ['required', 'string'],
        ]);

        try {
            DB::transaction(function () use ($warranty, $request) {
                // 1. Tambah hitungan klaim garansi
                $warranty->increment('claim_count');

                $oldOrder = $warranty->serviceOrder;

                // 2. Buat Nomor Nota Baru dengan prefix SRV
                $datePrefix = 'SRV-' . now()->format('Ymd') . '-';
                $lastOrder = ServiceOrder::where('order_number', 'like', $datePrefix . '%')
                    ->orderBy('order_number', 'desc')
                    ->lockForUpdate() // Mencegah Race Condition
                    ->first();
                    
                $nextSequence = $lastOrder ? (int) substr($lastOrder->order_number, -3) + 1 : 1;
                // Strict Type Casting untuk str_pad
                $orderNumber = $datePrefix . str_pad((string) $nextSequence, 3, '0', STR_PAD_LEFT);

                // 3. Buat Nota Servisan Baru dengan harga Rp 0
                $newOrder = ServiceOrder::create([
                    'order_number' => $orderNumber,
                    'customer_id' => $oldOrder->customer_id,
                    'device_id' => $oldOrder->device_id,
                    'complaint' => 'KLAIM GARANSI (' . $warranty->warranty_code . '): ' . $request->complaint,
                    'equipments' => $oldOrder->equipments, 
                    'status' => ServiceStatus::WAITING_CHECKING,
                    'is_technician_on_site' => false,
                    'estimated_cost' => 0,
                    'down_payment' => 0,
                    'created_by' => auth()->id(),
                ]);

                // 4. Memicu Event PDF dan Kirim WhatsApp untuk Nota Baru
                ServiceOrderCreated::dispatch($newOrder);
            });

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Klaim Garansi berhasil. Nota servisan baru telah diterbitkan.'
            ]);

            return redirect()->route('services.index');

        } catch (\Exception $e) {
            Log::error('Gagal memproses klaim garansi: ' . $e->getMessage());
            
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Terjadi kesalahan sistem saat memproses klaim garansi.'
            ]);
            
            return back();
        }
    }
}