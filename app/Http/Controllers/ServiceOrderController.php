<?php

namespace App\Http\Controllers;

use App\Events\ServiceOrderCreated;
use App\Events\ServiceOrderBroadcast;
use App\Enums\ServiceStatus;
use App\Http\Requests\StoreServiceOrderRequest;
use App\Http\Requests\UpdateServiceOrderRequest;
use App\Models\Customer;
use App\Models\Device;
use App\Models\User;
use App\Models\ServiceOrder;
use App\Models\Warranty;
use App\Services\WaGateway;
use App\Notifications\NewServiceOrderNotification;
use App\Notifications\ServiceOrderNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class ServiceOrderController extends Controller
{
    /**
     * Menampilkan daftar pesanan servis (Data Table Front Office).
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status', 'date', 'type', 'per_page']);
        $perPage = $filters['per_page'] ?? '10';
        $limit = $perPage === 'all' ? 500 : (int) $perPage;

        $query = ServiceOrder::query()->with([
            'customer' => fn($q) => $q->withTrashed(),
            'device' => fn($q) => $q->withTrashed(),
        ]);

        // OPTIMASI: Menggunakan Local Scope `scopeSearch` dari Model ServiceOrder!
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
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

        $services = $query->latest('id')->paginate($limit)->withQueryString();

        $services->through(function ($service) {

            $baseCost = $service->final_cost ?? $service->estimated_cost ?? 0;
            $downPayment = $service->down_payment ?? 0;
            $remaining = max(0, $baseCost - $downPayment);

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
                'created_at' => $service->created_at->format('d M Y, H:i'),
                'financials' => [
                    'estimated' => $service->estimated_cost,
                    'final' => $service->final_cost,
                    'dp' => $service->down_payment,
                    'remaining' => $remaining,
                ],
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

    /**
     * Menyimpan data servis baru, pelanggan, dan memicu notifikasi.
     */
    public function store(StoreServiceOrderRequest $request): RedirectResponse
    {
        try {
            $serviceOrder = DB::transaction(function () use ($request) {
                // Buat/ambil Pelanggan
                $customer = Customer::firstOrCreate(
                    ['phone' => $request->phone],
                    ['name' => $request->name ?? 'Tanpa Nama']
                );

                // Buat/ambil Perangkat
                if ($request->device_id) {
                    $device = Device::findOrFail($request->device_id);
                } else {
                    $device = $customer->devices()->create([
                        'device_type' => $request->device_type ?? 'Laptop',
                        'brand' => $request->brand,
                        'model' => $request->model,
                    ]);
                }

                // Generate Nomor Order (Contoh: SRV-20231024-001)
                $datePrefix = 'SRV-' . now()->format('Ymd') . '-';
                $lastOrder = ServiceOrder::where('order_number', 'like', $datePrefix . '%')
                    ->orderBy('order_number', 'desc')
                    ->lockForUpdate() // Mencegah bentrok (Race Condition)
                    ->first();

                $nextSequence = $lastOrder ? (int) substr($lastOrder->order_number, -3) + 1 : 1;
                $orderNumber = $datePrefix . str_pad((string)$nextSequence, 3, '0', STR_PAD_LEFT);

                $status = $request->is_technician_on_site
                    ? ServiceStatus::APPROVED
                    : ServiceStatus::WAITING_CHECKING;

                // Simpan Service Order
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

            // Trigger Event untuk generate PDF dan Kirim WA secara antrean (Queued)
            ServiceOrderCreated::dispatch($serviceOrder);

            // Kirim notifikasi In-App ke Teknisi & Administrator
            $usersToNotify = User::role(['teknisi', 'administrator'])
                ->where('id', '!=', auth()->id())
                ->get();

            Notification::send(
                $usersToNotify,
                new NewServiceOrderNotification($serviceOrder, auth()->user()->name)
            );

            event(new ServiceOrderBroadcast($serviceOrder, 'created'));

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Servisan baru berhasil didaftarkan. Nota akan segera dikirim.'
            ]);

            return redirect()->route('services.index');
        } catch (\Exception $e) {
            Log::error('ServiceOrder Store Error: ' . $e->getMessage());

            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal mendaftarkan servis. Silakan coba lagi.'
            ]);
            return back()->withInput();
        }
    }

    /**
     * Menampilkan detail spesifik dari pesanan servis.
     */
    public function show(ServiceOrder $serviceOrder): Response
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
            ->whereNotIn('status', [ServiceStatus::TAKEN->value, ServiceStatus::CANCELLED->value])
            ->orderBy('updated_at', 'desc')
            ->limit(15)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'order_number' => $item->order_number,
                'customer_name' => $item->customer->name,
                'device_name' => $item->device->brand . ' ' . $item->device->model,
                'status_label' => $item->status->label(),
            ]);

        return Inertia::render('services/detail', [
            'serviceOrder' => $serviceOrder,
            'recentServices' => $recentServices,
        ]);
    }

    /**
     * Memperbarui status, biaya, atau data penuh servis.
     */
    public function update(UpdateServiceOrderRequest $request, ServiceOrder $serviceOrder): RedirectResponse
    {
        $validated = $request->validated();
        $user = auth()->user();

        $oldStatus = $serviceOrder->status->value;
        $newStatus = $validated['status'];

        DB::transaction(function () use ($validated, $request, $serviceOrder, $user, $oldStatus, $newStatus) {

            // A. UPDATE PENUH (Data Master Pelanggan & Perangkat)
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

            // B. UPDATE OPERASIONAL (Teknisi, Status, dan Biaya)
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

            event(new ServiceOrderBroadcast($serviceOrder, 'updated'));

            // C. OTOMATISASI GARANSI (Hanya Dibuat Saat Unit Diambil Pertama Kali)
            if ($oldStatus !== ServiceStatus::TAKEN->value && $newStatus === ServiceStatus::TAKEN->value) {

                $warrantyDays = (int) $request->input('warranty_days', 0);

                if ($warrantyDays > 0) {
                    $prefix = 'GAR-' . now()->format('Ymd') . '-';
                    $lastWarranty = Warranty::where('warranty_code', 'like', $prefix . '%')
                        ->orderBy('warranty_code', 'desc')
                        ->lockForUpdate()
                        ->first();

                    $nextSeq = $lastWarranty ? (int) substr($lastWarranty->warranty_code, -3) + 1 : 1;
                    $warrantyCode = $prefix . str_pad((string)$nextSeq, 3, '0', STR_PAD_LEFT);

                    $serviceOrder->warranty()->create([
                        'warranty_code' => $warrantyCode,
                        'start_date' => now(),
                        'end_date' => now()->addDays($warrantyDays),
                        'status' => 'active',
                    ]);

                    $waMessage = "Terima kasih Kak *{$serviceOrder->customer->name}* telah mempercayakan perbaikan unit *{$serviceOrder->device->brand}* di Anugerah Computer.\n\n"
                        . "Unit Anda telah diserahkan dan masa garansi perbaikan aktif selama {$warrantyDays} hari hingga *" . now()->addDays($warrantyDays)->format('d M Y') . "*.\n"
                        . "Kode Garansi: *{$warrantyCode}*\n\n"
                        . "Harap simpan pesan ini sebagai bukti garansi. Semoga unitnya awet selalu! 🙏";
                } else {
                    $waMessage = "Terima kasih Kak *{$serviceOrder->customer->name}* telah mempercayakan perbaikan unit *{$serviceOrder->device->brand}* di Anugerah Computer.\n\n"
                        . "Unit Anda telah diserahkan. Semoga unitnya awet dan dapat digunakan dengan lancar kembali! Jika ada keluhan lain, jangan ragu untuk menghubungi kami. 🙏";
                }

                // Panggil WhatsApp API Gateway
                WaGateway::sendMessage($serviceOrder->customer->phone, $waMessage, $serviceOrder->id, 'send_warranty');
            }
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Data nota ' . $serviceOrder->order_number . ' berhasil diperbarui.'
        ]);

        return back();
    }

    /**
     * Menghapus pesanan servis.
     */
    public function destroy(ServiceOrder $serviceOrder): RedirectResponse
    {
        if (!auth()->user()->hasRole('administrator')) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Hanya administrator yang dapat menghapus data servisan.']);
            return back();
        }

        // Mencegah penghapusan jika servis masih aktif diproses atau sudah selesai diambil
        $blockedStatuses = [
            ServiceStatus::IN_PROGRESS->value,
            ServiceStatus::COMPLETED->value,
            ServiceStatus::TAKEN->value,
        ];

        if (in_array($serviceOrder->status->value, $blockedStatuses)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Servisan yang sedang diproses atau sudah selesai tidak dapat dihapus.']);
            return back();
        }

        $orderNumber = $serviceOrder->order_number;

        event(new ServiceOrderBroadcast($serviceOrder, 'deleted'));

        $serviceOrder->delete();

        Inertia::flash('toast', ['type' => 'info', 'message' => "Servisan {$orderNumber} telah dihapus."]);
        return redirect()->route('services.index');
    }

    /**
     * API: Mencari pelanggan berdasarkan nomor telepon (Autofill form Front Office).
     */
    public function searchCustomer(Request $request): JsonResponse
    {
        $phone = $request->query('phone');
        if (strlen((string) $phone) < 4) return response()->json([]);

        $customers = Customer::with('devices')->where('phone', 'like', "%{$phone}%")->limit(5)->get();
        return response()->json($customers);
    }

    /**
     * Memicu pengiriman penawaran harga via WhatsApp ke pelanggan.
     */
    // public function triggerWhatsappOffer(Request $request, ServiceOrder $serviceOrder): RedirectResponse
    // {
    //     if ($serviceOrder->estimated_cost <= 0) {
    //         Inertia::flash('toast', ['type' => 'error', 'message' => 'Gagal: Estimasi biaya harus diisi terlebih dahulu sebelum mengirim penawaran.']);
    //         return back();
    //     }

    //     $isSent = WaGateway::sendOffer($serviceOrder);

    //     if ($isSent) {
    //         $serviceOrder->update(['status' => ServiceStatus::WAITING_APPROVAL]);
    //         Inertia::flash('toast', ['type' => 'success', 'message' => 'Penawaran WA terkirim! Sistem AI kini siaga menunggu balasan pelanggan.']);
    //     } else {
    //         Inertia::flash('toast', ['type' => 'error', 'message' => 'GAGAL MENGIRIM WA! Pastikan server WhatsApp Anda aktif.']);
    //     }

    //     return back();
    // }

    /**
     * Memicu pengiriman pesan WhatsApp ke pelanggan (Cerdas Sesuai Status).
     */
    public function triggerWhatsappOffer(Request $request, ServiceOrder $serviceOrder): RedirectResponse
    {
        $status = $serviceOrder->status->value;

        // ==========================================
        // KONDISI 1: AWAL SERVIS (KIRIM PENAWARAN HARGA)
        // ==========================================
        if (in_array($status, [ServiceStatus::WAITING_CHECKING->value, ServiceStatus::WAITING_APPROVAL->value])) {
            
            if ($serviceOrder->estimated_cost <= 0) {
                Inertia::flash('toast', ['type' => 'error', 'message' => 'Gagal: Estimasi biaya harus diisi terlebih dahulu sebelum mengirim penawaran.']);
                return back();
            }

            $isSent = WaGateway::sendOffer($serviceOrder);

            if ($isSent) {
                // HANYA ubah status jika sebelumnya masih "Menunggu Pengecekan"
                if ($status === ServiceStatus::WAITING_CHECKING->value) {
                    $serviceOrder->update(['status' => ServiceStatus::WAITING_APPROVAL->value]);
                }
                Inertia::flash('toast', ['type' => 'success', 'message' => 'Penawaran WA terkirim! Sistem AI kini siaga menunggu balasan pelanggan.']);
            } else {
                Inertia::flash('toast', ['type' => 'error', 'message' => 'GAGAL MENGIRIM WA! Pastikan server API Baileys Anda menyala.']);
            }
            
            return back();
        }

        // ==========================================
        // KONDISI 2: PROSES / SELESAI / BATAL (KIRIM UPDATE STATUS)
        // ==========================================
        $isSent = WaGateway::sendStatusUpdate($serviceOrder);

        if ($isSent) {
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Pesan update status berhasil dikirim ke WhatsApp pelanggan!']);
        } else {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'GAGAL MENGIRIM WA! Pastikan server API Baileys Anda menyala.']);
        }

        return back();
    }

    /**
     * Menghasilkan dan menampilkan PDF Nota Servis secara langsung (Stream).
     */
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
     * KANBAN BOARD: Menampilkan papan operasi teknisi secara real-time.
     */
    public function kanban(): Response
    {
        $services = ServiceOrder::with(['customer', 'device'])
            ->whereNotIn('status', [ServiceStatus::TAKEN->value, ServiceStatus::CANCELLED->value])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(fn($service) => [
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
            ]);

        return Inertia::render('services/kanban', [
            'services' => $services
        ]);
    }
}
