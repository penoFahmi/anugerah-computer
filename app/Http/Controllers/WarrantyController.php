<?php

namespace App\Http\Controllers;

use App\Models\Warranty;
use App\Models\ServiceOrder;
use App\Enums\ServiceStatus;
use App\Events\ServiceOrderCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WarrantyController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'per_page']);
        $perPage = $filters['per_page'] ?? 10;

        $query = Warranty::with(['serviceOrder.customer', 'serviceOrder.device']);

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

        $limit = $perPage === 'all' ? 500 : $perPage;
        $warranties = $query->latest()->paginate($limit)->withQueryString();

        $warranties->through(function ($w) {
            $isExpired = $w->end_date < today() && $w->status === 'active';
            $currentStatus = $isExpired ? 'expired' : $w->status;

            return [
                'id' => $w->id,
                'warranty_code' => $w->warranty_code,
                'order_number' => $w->serviceOrder->order_number,
                'customer_name' => $w->serviceOrder->customer->name,
                'customer_phone' => $w->serviceOrder->customer->phone,
                'device_name' => $w->serviceOrder->device->brand . ' ' . $w->serviceOrder->device->model,
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

    public function update(Request $request, Warranty $warranty)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,void',
            'notes' => 'required|string|max:1000',
        ]);

        $warranty->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Status garansi ' . $warranty->warranty_code . ' berhasil dihanguskan.'
        ]);

        return redirect()->back();
    }

    public function claim(Request $request, Warranty $warranty)
    {
        $request->validate([
            'complaint' => 'required|string',
        ]);

        try {
            DB::transaction(function () use ($warranty, $request) {
                // 1. Tambah hitungan klaim garansi
                $warranty->increment('claim_count');

                $oldOrder = $warranty->serviceOrder;

                // 2. Buat Nomor Nota Baru
                $datePrefix = 'SRV-' . now()->format('Ymd') . '-';
                $lastOrder = ServiceOrder::where('order_number', 'like', $datePrefix . '%')
                    ->orderBy('order_number', 'desc')
                    ->lockForUpdate()
                    ->first();
                    
                $nextSequence = $lastOrder ? (int) substr($lastOrder->order_number, -3) + 1 : 1;
                $orderNumber = $datePrefix . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);

                // 3. Buat Nota Servisan Baru dengan harga Rp 0
                $newOrder = ServiceOrder::create([
                    'order_number' => $orderNumber,
                    'customer_id' => $oldOrder->customer_id,
                    'device_id' => $oldOrder->device_id,
                    'complaint' => $request->complaint,
                    'equipments' => $oldOrder->equipments, 
                    'status' => ServiceStatus::WAITING_CHECKING,
                    'is_technician_on_site' => false,
                    'estimated_cost' => 0,
                    'down_payment' => 0,
                    'created_by' => auth()->id(),
                ]);

                // 4. Memicu Event PDF dan Notifikasi untuk Nota Baru
                ServiceOrderCreated::dispatch($newOrder);
            });

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Klaim Garansi berhasil. Nota servisan baru telah diterbitkan.'
            ]);

            return redirect()->route('services.index');

        } catch (\Exception $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal memproses klaim garansi: ' . $e->getMessage()
            ]);
            return back();
        }
    }
}