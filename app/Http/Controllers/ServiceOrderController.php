<?php

namespace App\Http\Controllers;

use App\Enums\ServiceStatus;
use App\Http\Requests\StoreServiceOrderRequest;
use App\Http\Requests\UpdateServiceOrderRequest;
use App\Models\Customer;
use App\Models\Device;
use App\Models\ServiceOrder;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use illuminate\Http\Request;

class ServiceOrderController extends Controller
{

    public function index(Request $request)
    {
        $search = $request->input('search');
        $statusFilter = $request->input('status', 'all'); // Default 'all' untuk tab Semua
        $perPage = $request->input('per_page', 10);

        // 1. Bangun Query Utama dengan Relasi (Eager Loading) agar performa cepat
        $query = ServiceOrder::query()->with(['customer', 'device']);

        $query = ServiceOrder::query()->with([
            'customer' => fn($q) => $q->withTrashed(),
            'device' => fn($q) => $q->withTrashed(),
        ]);

        // 2. Filter Pencarian (Cari di Nota, Nama Pelanggan, atau No WA)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($qCustomer) use ($search) {
                      $qCustomer->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        // 3. Filter Status (Dari klik Tabs UI nantinya)
        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        // 4. Urutkan dari yang paling baru masuk, lalu jalankan Pagination
        $services = $query->latest()->paginate($perPage)->withQueryString();

        // 5. Rapikan format data sebelum dikirim ke Frontend (React)
        $services->through(function ($service) {
            return [
                'id' => $service->id,
                'order_number' => $service->order_number,
                'customer_name' => $service->customer->name,
                'customer_phone' => $service->customer->phone,
                'device_name' => $service->device->brand . ' ' . $service->device->model,
                'complaint' => $service->complaint,
                'status' => $service->status->value, // Nilai asli: 'waiting_checking'
                'status_label' => $service->status->label(), // Nilai UI: 'Menunggu Dicek'
                'estimated_cost' => $service->estimated_cost,
                'created_at' => $service->created_at->format('d M Y, H:i'),
            ];
        });

        return Inertia::render('services/list', [
            'serviceOrders' => $services,
            'filters' => [
                'search' => $search ?? '',
                'status' => $statusFilter,
                'per_page' => $perPage,
            ]
        ]);
    }

    // 2. Menyimpan data servisan baru
    public function store(StoreServiceOrderRequest $request)
    {
        try {
            DB::beginTransaction();

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

            $serviceOrder = ServiceOrder::create([
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

            DB::commit();

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Servisan baru berhasil didaftarkan dengan Nota: ' . $orderNumber
            ]);

            return redirect()->route('services.index');

        } catch (\Exception $e) {
            DB::rollBack();
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal mendaftarkan servis: ' . $e->getMessage()
            ]);

            return back()->withInput();
        }
    }

    // 3. API Pencarian Pelanggan untuk Autocomplete
    public function searchCustomer(Request $request)
    {
        $phone = $request->query('phone');

        if (strlen($phone) < 4) {
            return response()->json([]);
        }

        // Cari pelanggan beserta data laptop yang pernah dia bawa sebelumnya
        $customers = Customer::with('devices')
            ->where('phone', 'like', "%{$phone}%")
            ->limit(5)
            ->get();

        return response()->json($customers);
    }

    public function update(UpdateServiceOrderRequest $request, ServiceOrder $serviceOrder)
    {
        $validated = $request->validated();

        // Jika status diubah menjadi 'Sedang Dikerjakan' atau 'Selesai', catat siapa teknisinya
        if (in_array($validated['status'], [ServiceStatus::IN_PROGRESS->value, ServiceStatus::COMPLETED->value]) && is_null($serviceOrder->technician_id)) {
            $serviceOrder->technician_id = auth()->id();
        }

        // Jika status diubah menjadi 'Sudah Diambil', catat kasir penyerahnya
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

    // 5. Trigger Pengiriman Penawaran WA & Standby AI
    public function triggerWhatsappOffer(Request $request, ServiceOrder $serviceOrder)
    {
        // Validasi Keamanan: Pastikan estimasi biaya sudah diisi oleh teknisi
        if ($serviceOrder->estimated_cost <= 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal: Estimasi biaya harus diisi terlebih dahulu sebelum mengirim penawaran ke pelanggan.'
            ]);
            return redirect()->back();
        }

        // 1. Ubah status menjadi Menunggu Konfirmasi
        $serviceOrder->update([
            'status' => ServiceStatus::WAITING_APPROVAL
        ]);

        // 2. TODO (Fase AI Skripsi): Panggil Class Service WaGateway untuk mengirim pesan
        // App\Services\WaGateway::sendOffer($serviceOrder);
        // App\Models\ChatLog::create([...]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Penawaran WA terkirim! Sistem AI kini siaga menunggu balasan pelanggan.'
        ]);

        return redirect()->back();
    }
}