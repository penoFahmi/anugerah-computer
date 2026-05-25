<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceOrderRequest;
use App\Models\Customer;
use App\Models\Device;
use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ServiceOrderController extends Controller
{
    public function index(Request $request)
    {
        // Menampilkan daftar servis beserta relasinya untuk tabel di Frontend
        $services = ServiceOrder::with(['customer', 'device', 'technician'])
            ->when($request->search, function ($query, $search) {
                $query->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('service/list', [
            'services' => $services,
            'filters'  => $request->only('search'),
        ]);
    }

    public function store(Request $request)
{
    // Validasi data (termasuk biaya jika teknisi ada)
    $validated = $request->validate([
        'customer_name' => 'required|string',
        'customer_phone' => 'required|string',
        'brand' => 'required|string',
        'model' => 'required|string',
        'complaint' => 'required|string',
        'is_technician_on_site' => 'boolean',
        'estimated_cost' => 'nullable|numeric',
        'technician_notes' => 'nullable|string',
        'direct_decision' => 'required|in:waiting,approved,cancelled',
    ]);

    DB::transaction(function () use ($validated) {
        $customer = Customer::firstOrCreate(
            ['phone' => $validated['customer_phone']], 
            ['name' => $validated['customer_name']]
        );

        $device = Device::firstOrCreate([
            'customer_id' => $customer->id,
            'brand' => $validated['brand'],
            'model' => $validated['model']
        ]);

        $orderNumber = 'SRV-' . date('Ymd') . '-' . rand(1000, 9999);

        // PENENTUAN STATUS BERDASARKAN FLOWCHART
        $status = 'waiting_checking'; // Default (Alur Kanan Flowchart)

        if ($validated['is_technician_on_site']) {
            if ($validated['direct_decision'] === 'approved') {
                $status = 'approved'; // Alur Kiri: Setuju
            } elseif ($validated['direct_decision'] === 'cancelled') {
                $status = 'cancelled'; // Alur Kiri: Batal
            }
        }

        $serviceOrder = ServiceOrder::create([
            'order_number' => $orderNumber,
            'customer_id' => $customer->id,
            'device_id' => $device->id,
            'complaint' => $validated['complaint'],
            'is_technician_on_site' => $validated['is_technician_on_site'],
            'estimated_cost' => $validated['estimated_cost'] ?: null,
            'technician_notes' => $validated['technician_notes'],
            'status' => $status,
            'created_by' => auth()->id(),
            'technician_id' => $validated['is_technician_on_site'] ? auth()->id() : null, // Jika teknisi di tempat, dialah teknisinya
        ]);

        // LOGIKA PENGIRIMAN WHATSAPP (Sesuai Flowchart)
        if ($validated['is_technician_on_site'] && $validated['direct_decision'] !== 'waiting') {
            // TODO: Panggil Job API WA Gateway (Kirim Nota Digital ke $customer->phone)
            // SendWhatsAppReceipt::dispatch($serviceOrder);
        }
    });

    return back();
}
}