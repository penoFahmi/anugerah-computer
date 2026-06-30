<?php

namespace App\Http\Controllers;

use App\Events\ServiceOrderCreated;
use App\Enums\ServiceStatus;
use App\Http\Requests\StoreServiceOrderRequest;
use App\Http\Requests\UpdateServiceOrderRequest;
use App\Models\Customer;
use App\Models\Device;
use App\Models\User;
use App\Models\ServiceOrder;
use App\Models\Warranty;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\WaGateway;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Notification;
use App\Notifications\NewServiceOrderNotification;

class ServiceOrderController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'date', 'type', 'per_page']);
        $perPage = $filters['per_page'] ?? 10;

        $query = ServiceOrder::query()->with([
            'customer' => fn($q) => $q->withTrashed(),
            'device' => fn($q) => $q->withTrashed(),
        ]);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $cleanSearch = preg_replace('/[^0-9]/', '', $search);

            $searchPhone = $search;
            if (!empty($cleanSearch)) {
                if (str_starts_with($cleanSearch, '0')) $searchPhone = '62' . substr($cleanSearch, 1);
                elseif (str_starts_with($cleanSearch, '8')) $searchPhone = '62' . $cleanSearch;
                else $searchPhone = $cleanSearch;
            }

            $query->where(function ($q) use ($search, $searchPhone) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($qCustomer) use ($search, $searchPhone) {
                        $qCustomer->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$searchPhone}%");
                    });
            });
        }

        if (!empty($filters['date'])) {
            match ($filters['date']) {
                'today' => $query->whereDate('created_at', today()),
                'this_week' => $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]),
                'this_month' => $query->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year),
                default => null,
            };
        }

        if (!empty($filters['type']) && in_array($filters['type'], ['laptop', 'pc', 'printer'])) {
            $query->whereHas('device', fn($q) => $q->where('device_type', $filters['type']));
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        $query->latest('id'); 

        if ($perPage === 'all') {
            $limit = 500;
        } else {
            $limit = (int) $perPage;
        }

        $services = $query->paginate($limit)->withQueryString();

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
                'final_cost' => $service->final_cost, // <--- TAMBAHAN UNTUK REACT UI
                'technician_notes' => $service->technician_notes,
                'created_at' => $service->created_at->format('d M Y, H:i'),
            ];
        });

        return Inertia::render('services/list', [
            'serviceOrders' => $services,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
                'date' => $filters['date'] ?? '',
                'type' => $filters['type'] ?? '',
                'per_page' => $perPage,
            ]
        ]);
    }

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
                    ->lockForUpdate()
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

            ServiceOrderCreated::dispatch($serviceOrder);

            $usersToNotify = User::role(['teknisi', 'administrator'])
                ->where('id', '!=', auth()->id())
                ->get();

            Notification::send(
                $usersToNotify,
                new NewServiceOrderNotification($serviceOrder, auth()->user()->name)
            );

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

    public function show(ServiceOrder $serviceOrder)
    {
        $serviceOrder->load([
            'customer' => fn($q) => $q->withTrashed(),
            'device' => fn($q) => $q->withTrashed(),
            'createdBy:id,name',
            'technician:id,name',
            'handedOverBy:id,name',
            'warranty'
        ]);

        $recentServices = ServiceOrder::with(['customer', 'device'])
            ->where('id', '!=', $serviceOrder->id)
            ->whereNotIn('status', ['taken', 'cancelled'])
            ->orderBy('updated_at', 'desc')
            ->limit(15)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'order_number' => $item->order_number,
                    'customer_name' => $item->customer->name,
                    'device_name' => $item->device->brand . ' ' . $item->device->model,
                    'status_label' => $item->status->label(),
                ];
            });

        return Inertia::render('services/detail', [
            'serviceOrder' => $serviceOrder,
            'recentServices' => $recentServices,
        ]);
    }

    public function update(UpdateServiceOrderRequest $request, ServiceOrder $serviceOrder)
    {
        $validated = $request->validated();
        $user = auth()->user();

        $oldStatus = $serviceOrder->status->value;
        $newStatus = $validated['status'];

        DB::transaction(function () use ($validated, $request, $serviceOrder, $user, $oldStatus, $newStatus) {

            // A. UPDATE PENUH (Data Master)
            if ($request->boolean('is_full_update') && $user->hasAnyRole(['administrator', 'pegawai'])) {
                $serviceOrder->customer->update([
                    'name' => $validated['name'],
                    'phone' => $validated['phone'],
                ]);

                $serviceOrder->device->update([
                    'device_type' => $validated['device_type'] ?? 'Laptop',
                    'brand' => $validated['brand'],
                    'model' => $validated['model'],
                ]);

                $updateData = [
                    'complaint' => $validated['complaint'],
                    'equipments' => $validated['equipments'] ?? [],
                ];
            } else {
                $updateData = [];
            }

            // B. UPDATE OPERASIONAL
            if (in_array($newStatus, [ServiceStatus::IN_PROGRESS->value, ServiceStatus::COMPLETED->value]) && is_null($serviceOrder->technician_id)) {
                $updateData['technician_id'] = $user->id;
            }

            if ($newStatus === ServiceStatus::TAKEN->value && is_null($serviceOrder->handed_over_by)) {
                $updateData['handed_over_by'] = $user->id;
            }

            $updateData['status'] = $newStatus;

            if (array_key_exists('estimated_cost', $validated)) $updateData['estimated_cost'] = $validated['estimated_cost'];
            if (array_key_exists('final_cost', $validated)) $updateData['final_cost'] = $validated['final_cost'];
            if (array_key_exists('down_payment', $validated)) $updateData['down_payment'] = $validated['down_payment'];
            if (array_key_exists('technician_notes', $validated)) $updateData['technician_notes'] = $validated['technician_notes'];

            $serviceOrder->update($updateData);

            // C. OTOMATISASI GARANSI (Jika Pelanggan Mengambil Unit / Lunas)
            if ($oldStatus !== ServiceStatus::TAKEN->value && $newStatus === ServiceStatus::TAKEN->value) {
                
                // Ambil jumlah hari garansi dari input (Default 0 jika kosong)
                $warrantyDays = (int) $request->input('warranty_days', 0);

                if ($warrantyDays > 0) {
                    // JIKA ADA GARANSI (> 0 Hari)
                    $prefix = 'GAR-' . now()->format('Ymd') . '-';
                    $lastWarranty = Warranty::where('warranty_code', 'like', $prefix . '%')
                        ->orderBy('warranty_code', 'desc')
                        ->lockForUpdate()
                        ->first();
                        
                    $nextSeq = $lastWarranty ? (int) substr($lastWarranty->warranty_code, -3) + 1 : 1;
                    $warrantyCode = $prefix . str_pad($nextSeq, 3, '0', STR_PAD_LEFT);

                    $serviceOrder->warranty()->create([
                        'warranty_code' => $warrantyCode,
                        'start_date' => now(),
                        'end_date' => now()->addDays($warrantyDays), // Dinamis sesuai pilihan kasir
                        'status' => 'active',
                    ]);

                    $waMessage = "Terima kasih Kak *{$serviceOrder->customer->name}* telah mempercayakan perbaikan unit *{$serviceOrder->device->brand}* di Anugerah Computer.\n\n"
                               . "Unit Anda telah diserahkan dan masa garansi perbaikan aktif selama {$warrantyDays} hari hingga *" . now()->addDays($warrantyDays)->format('d M Y') . "*.\n"
                               . "Kode Garansi: *{$warrantyCode}*\n\n"
                               . "Harap simpan pesan ini sebagai bukti garansi. Semoga unitnya awet selalu! 🙏";
                } else {
                    // JIKA TIDAK ADA GARANSI (0 Hari)
                    $waMessage = "Terima kasih Kak *{$serviceOrder->customer->name}* telah mempercayakan perbaikan unit *{$serviceOrder->device->brand}* di Anugerah Computer.\n\n"
                               . "Unit Anda telah diserahkan. Semoga unitnya awet dan dapat digunakan dengan lancar kembali! Jika ada keluhan lain, jangan ragu untuk menghubungi kami. 🙏";
                }
                
                // Kirim Pesan ke WhatsApp Pelanggan
                WaGateway::sendMessage($serviceOrder->customer->phone, $waMessage, $serviceOrder->id, 'send_warranty');
            }
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Data nota ' . $serviceOrder->order_number . ' berhasil diperbarui.'
        ]);

        return redirect()->back();
    }

    public function destroy(ServiceOrder $serviceOrder)
    {
        if (!auth()->user()->hasRole('administrator')) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Hanya administrator yang dapat menghapus data servisan.']);
            return redirect()->back();
        }

        $blockedStatuses = [
            ServiceStatus::IN_PROGRESS->value,
            ServiceStatus::COMPLETED->value,
            ServiceStatus::TAKEN->value,
        ];

        if (in_array($serviceOrder->status->value, $blockedStatuses)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Servisan yang sedang diproses atau sudah selesai tidak dapat dihapus.']);
            return redirect()->back();
        }

        $orderNumber = $serviceOrder->order_number;
        $serviceOrder->delete();

        Inertia::flash('toast', ['type' => 'info', 'message' => "Servisan {$orderNumber} telah dihapus."]);
        return redirect()->route('services.index');
    }

    public function searchCustomer(Request $request)
    {
        $phone = $request->query('phone');
        if (strlen($phone) < 4) return response()->json([]);

        $customers = Customer::with('devices')->where('phone', 'like', "%{$phone}%")->limit(5)->get();
        return response()->json($customers);
    }

    public function triggerWhatsappOffer(Request $request, ServiceOrder $serviceOrder)
    {
        if ($serviceOrder->estimated_cost <= 0) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Gagal: Estimasi biaya harus diisi terlebih dahulu sebelum mengirim penawaran.']);
            return redirect()->back();
        }

        $isSent = WaGateway::sendOffer($serviceOrder);

        if ($isSent) {
            $serviceOrder->update(['status' => ServiceStatus::WAITING_APPROVAL]);
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Penawaran WA terkirim! Sistem AI kini siaga menunggu balasan pelanggan.']);
        } else {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'GAGAL MENGIRIM WA! Pastikan server WhatsApp Anda aktif dan sudah Scan QR.']);
        }

        return redirect()->back();
    }

    public function printTicketPDF(ServiceOrder $serviceOrder)
    {
        $serviceOrder->load([
            'customer' => fn($q) => $q->withTrashed(),
            'device' => fn($q) => $q->withTrashed(),
            'createdBy:id,name',
            'technician:id,name',
            'handedOverBy:id,name',
            'warranty'
        ]);

        $pdf = Pdf::loadView('pdf.service_receipt', ['order' => $serviceOrder])
                  ->setPaper([0, 0, 226.77, 600], 'portrait');
        return $pdf->stream("nota-{$serviceOrder->order_number}.pdf");
    }

    /**
     * 9. KANBAN BOARD: Halaman Papan Teknisi
     */
    public function kanban()
    {
        // Ambil semua servisan yang belum selesai/diambil/dibatalkan
        $services = ServiceOrder::with(['customer', 'device'])
            ->whereNotIn('status', ['taken', 'cancelled'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($service) {
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
                    'final_cost' => $service->final_cost,
                    'down_payment' => $service->down_payment,
                    'technician_notes' => $service->technician_notes,
                    'created_at' => $service->created_at->diffForHumans(), 
                ];
            });

        return Inertia::render('services/kanban', [
            'services' => $services
        ]);
    }
}
