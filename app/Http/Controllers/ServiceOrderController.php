<?php

namespace App\Http\Controllers;

use App\Events\ServiceOrderCreated;
use App\Enums\ServiceStatus;
use App\Http\Requests\StoreServiceOrderRequest;
use App\Http\Requests\UpdateServiceOrderRequest;
use App\Models\Customer;
use App\Models\Device;
use App\Models\ServiceOrder;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\WaGateway;

class ServiceOrderController extends Controller
{
    /**
     * Menampilkan daftar semua data servisan dengan filter dan paginasi.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $statusFilter = $request->input('status', 'all');
        $perPage = $request->input('per_page', 10);
        $dateFilter = $request->input('date');
        $typeFilter = $request->input('type');

        $query = ServiceOrder::query()->with([
            'customer' => fn($q) => $q->withTrashed(),
            'device' => fn($q) => $q->withTrashed(),
        ]);

        if ($search) {
            $searchPhone = $search;
            $cleanSearch = preg_replace('/[^0-9]/', '', $search);
            
            if (!empty($cleanSearch)) {
                if (str_starts_with($cleanSearch, '0')) {
                    $searchPhone = '62' . substr($cleanSearch, 1);
                } elseif (str_starts_with($cleanSearch, '8')) {
                    $searchPhone = '62' . $cleanSearch;
                } else {
                    $searchPhone = $cleanSearch;
                }
            }

            $query->where(function ($q) use ($search, $searchPhone) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($qCustomer) use ($search, $searchPhone) {
                      $qCustomer->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$searchPhone}%");
                  });
            });
        }

        if ($dateFilter) {
            match ($dateFilter) {
                'today' => $query->whereDate('created_at', today()),
                'this_week' => $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]),
                'this_month' => $query->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year),
                default => null,
            };
        }

        if ($typeFilter && in_array($typeFilter, ['laptop', 'pc', 'printer'])) {
            $query->whereHas('device', function ($q) use ($typeFilter) {
                $q->where('device_type', $typeFilter);
            });
        }

        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $services = $query->latest()->paginate($perPage)->withQueryString();

        $services->through(function ($service) {
            return [
                'id' => $service->id,
                'order_number' => $service->order_number,
                'customer_name' => $service->customer->name,
                'customer_phone' => $service->customer->phone,
                'device_name' => $service->device->brand . ' ' . $service->device->model,
                'complaint' => $service->complaint,
                'status' => $service->status->value,
                'status_label' => $service->status->label(),
                'estimated_cost' => $service->estimated_cost,
                'created_at' => $service->created_at->format('d M Y, H:i'),
            ];
        });

        return Inertia::render('services/list', [
            'serviceOrders' => $services,
            'filters' => [
                'search' => $search ?? '',
                'status' => $statusFilter,
                'date' => $dateFilter ?? '',
                'type' => $typeFilter ?? '',
                'per_page' => $perPage,
            ]
        ]);
    }
    
    /**
     * Menampilkan form untuk membuat data servisan baru.
     */
    public function create()
    {
        return Inertia::render('services/form');
    }

    /**
     * Menyimpan data servisan baru ke dalam database.
     */
    public function store(StoreServiceOrderRequest $request)
    {
        try {
            $serviceOrder = DB::transaction(function () use ($request) {
                $customer = Customer::firstOrCreate(
                    ['phone' => $request->phone],
                    ['name' => $request->name ?? 'Tanpa Nama']
                );

                if ($request->device_id) {
                    $device = Device::findOrFail($request->device_id);
                } else {
                    $device = $customer->devices()->create([
                        'device_type' => $request->device_type ?? 'Laptop',
                        'brand' => $request->brand,
                        'model' => $request->model,
                    ]);
                }

                $datePrefix = 'SRV-' . now()->format('Ymd') . '-';
                $lastOrder = ServiceOrder::where('order_number', 'like', $datePrefix . '%')
                    ->orderBy('order_number', 'desc')
                    ->first();
                $nextSequence = $lastOrder ? (int) substr($lastOrder->order_number, -3) + 1 : 1;
                $orderNumber = $datePrefix . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);

                $status = $request->is_technician_on_site 
                            ? ServiceStatus::APPROVED 
                            : ServiceStatus::WAITING_CHECKING;

                return ServiceOrder::create([
                    'order_number' => $orderNumber,
                    'customer_id' => $customer->id,
                    'device_id' => $device->id,
                    'complaint' => $request->complaint,
                    'equipments' => $request->equipments,
                    'status' => $status,
                    'is_technician_on_site' => $request->is_technician_on_site ?? false,
                    'estimated_cost' => $request->estimated_cost ?? 0,
                    'down_payment' => $request->down_payment ?? 0,
                    'created_by' => auth()->id(),
                ]);
            });

            // Dispatch an event to handle PDF generation and WA notification
            ServiceOrderCreated::dispatch($serviceOrder);

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Servisan baru berhasil didaftarkan. Nota akan segera dikirim.'
            ]);

            return redirect()->route('services.index');

        } catch (\Exception $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal mendaftarkan servis: ' . $e->getMessage()
            ]);

            return back()->withInput();
        }
    }

    /**
     * Menampilkan detail spesifik satu data servisan.
     */
    public function show(ServiceOrder $serviceOrder)
    {
        $serviceOrder->load([
            'customer' => fn($q) => $q->withTrashed(),
            'device' => fn($q) => $q->withTrashed(),
            'createdBy:id,name',
            'technician:id,name',
            'handedOverBy:id,name'
        ]);

        return Inertia::render('services/detail', [
            'serviceOrder' => $serviceOrder,
        ]);
    }

    /**
     * Menampilkan form untuk mengedit data servisan.
     */
    public function edit(ServiceOrder $serviceOrder)
    {
        $serviceOrder->load(['customer' => fn($q) => $q->withTrashed(), 'device' => fn($q) => $q->withTrashed()]);
        
        return Inertia::render('services/form', [
            'serviceOrder' => $serviceOrder,
        ]);
    }

    /**
     * Memperbarui data operasional servisan di database.
     */
    public function update(UpdateServiceOrderRequest $request, ServiceOrder $serviceOrder)
    {
        $validated = $request->validated();

        if (in_array($validated['status'], [ServiceStatus::IN_PROGRESS->value, ServiceStatus::COMPLETED->value]) && is_null($serviceOrder->technician_id)) {
            $serviceOrder->technician_id = auth()->id();
        }

        if ($validated['status'] === ServiceStatus::TAKEN->value && is_null($serviceOrder->handed_over_by)) {
            $serviceOrder->handed_over_by = auth()->id();
        }

        $serviceOrder->update([
            'status' => $validated['status'],
            'estimated_cost' => $validated['estimated_cost'] ?? $serviceOrder->estimated_cost,
            'technician_notes' => $validated['technician_notes'] ?? $serviceOrder->technician_notes,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Data operasional nota ' . $serviceOrder->order_number . ' berhasil diperbarui.'
        ]);

        return redirect()->back();
    }

    /**
     * Menghapus data servisan dari database.
     */
    public function destroy(ServiceOrder $serviceOrder)
    {
        // TODO: Tambahkan validasi kebijakan/policy di sini. 
        // Contoh: Jangan izinkan hapus jika status 'IN_PROGRESS' atau 'COMPLETED'.
        $serviceOrder->delete();

        Inertia::flash('toast', [
            'type' => 'info',
            'message' => 'Servisan ' . $serviceOrder->order_number . ' telah dihapus.'
        ]);

        return redirect()->route('services.index');
    }

    /**
     * API untuk pencarian pelanggan (autocomplete).
     */
    public function searchCustomer(Request $request)
    {
        $phone = $request->query('phone');

        if (strlen($phone) < 4) {
            return response()->json([]);
        }

        $customers = Customer::with('devices')
            ->where('phone', 'like', "%{$phone}%")
            ->limit(5)
            ->get();

        return response()->json($customers);
    }

    /**
     * Memicu pengiriman penawaran via WhatsApp dan mengubah status order.
     */
    public function triggerWhatsappOffer(Request $request, ServiceOrder $serviceOrder)
    {
        if ($serviceOrder->estimated_cost <= 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal: Estimasi biaya harus diisi terlebih dahulu sebelum mengirim penawaran ke pelanggan.'
            ]);
            return redirect()->back();
        }

        $serviceOrder->update([
            'status' => ServiceStatus::WAITING_APPROVAL
        ]);

        // Panggil Class Service WaGateway untuk mengirim pesan
        WaGateway::sendOffer($serviceOrder);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Penawaran WA terkirim! Sistem AI kini siaga menunggu balasan pelanggan.'
        ]);

        return redirect()->back();
    }
}
