<?php

namespace App\Http\Controllers\Services;

use App\Enums\ServiceStatus;
use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Events\ServiceOrderBroadcast;
use App\Events\ServiceOrderCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceOrderRequest;
use App\Http\Requests\UpdateServiceOrderRequest;
use App\Jobs\SendFinalReceiptPdf;
use App\Jobs\SendWaNotification;
use App\Models\Customer;
use App\Models\Device;
use App\Models\ServiceOrder;
use App\Models\SparePart;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Warranty;
use App\Services\WaGateway;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Imports\ServiceOrderImport;
use App\Exports\ServiceOrderExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

/**
 * [THESIS: SERVICE MANAGEMENT INFORMATION SYSTEM]
 * Controller utama untuk mengelola transisi status perbaikan perangkat lunak dan keras.
 * Modul ini mendigitalisasi beban administratif dan mengeliminasi redudansi data.
 * Memiliki integrasi langsung dengan Event Broadcasting dan WhatsApp Gateway
 * untuk mentransmisikan notifikasi tanda terima secara otomatis.
 */
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
            'customer' => fn ($q) => $q->withTrashed(),
            'device' => fn ($q) => $q->withTrashed(),
            'spareParts',
        ]);

        // OPTIMASI: Menggunakan Local Scope `scopeSearch` dari Model ServiceOrder!
        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (! empty($filters['date'])) {
            match ($filters['date']) {
                'today' => $query->whereDate('created_at', today()),
                'this_week' => $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]),
                'this_month' => $query->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year),
                default => null,
            };
        }

        if (! empty($filters['type']) && in_array($filters['type'], ['laptop', 'pc', 'printer'])) {
            $query->whereHas('device', fn ($q) => $q->where('device_type', $filters['type']));
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
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
                'device_name' => $service->device->brand.' '.$service->device->model,
                'complaint' => $service->complaint,
                'status' => $service->status->value,
                'status_label' => $service->status->label(),
                'estimated_cost' => $service->estimated_cost,
                'final_cost' => $service->final_cost,
                'down_payment' => $service->down_payment,
                'technician_notes' => $service->technician_notes,
                'is_unit_left_at_store' => $service->is_unit_left_at_store,
                'created_at' => $service->created_at->format('d M Y, H:i'),
                'spare_parts' => $service->spareParts->map(fn ($sp) => [
                    'id' => $sp->id,
                    'pivot_id' => $sp->pivot->id,
                    'name' => $sp->name,
                    'price' => $sp->pivot->price,
                    'quantity' => $sp->pivot->quantity,
                    'subtotal' => $sp->pivot->price * $sp->pivot->quantity,
                ]),
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
            ],
        ]);
    }

    /**
     * Download Excel template or export existing data.
     */
    public function exportExcel(Request $request)
    {
        if ($request->query('template')) {
            // Provide a quick empty template structure
            return response()->streamDownload(function () {
                $file = fopen('php://output', 'w');
                fputcsv($file, [
                    'Customer Name', 'Customer Phone', 'Device Brand', 'Device Model', 
                    'Complaint', 'Status', 'Estimated Cost', 'Down Payment', 
                    'Final Cost', 'Technician Notes', 'Created At'
                ]);
                fputcsv($file, [
                    'Budi Santoso', '081234567890', 'Asus', 'ROG Zephyrus', 
                    'Mati total kena air', 'completed', '1500000', '500000', 
                    '1500000', 'Ganti motherboard', '2023-12-01 14:00:00'
                ]);
                fclose($file);
            }, 'Template_Import_Servisan.csv');
        }

        return Excel::download(new ServiceOrderExport, 'Data_Servisan.xlsx');
    }

    /**
     * Handle the Excel file import.
     */
    public function importExcel(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            Excel::import(new ServiceOrderImport, $request->file('file'));

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Data dari Excel berhasil diimpor!',
            ]);
        } catch (\Exception $e) {
            Log::error('Excel Import Error: ' . $e->getMessage());

            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal mengimpor data. Pastikan format file sesuai template. (' . $e->getMessage() . ')',
            ]);
        }

        return back();
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

                // GENERATE NOMOR ORDER
                $datePrefix = 'SRV-'.now()->format('Ymd').'-';
                $lastOrder = ServiceOrder::where('order_number', 'like', $datePrefix.'%')
                    ->orderBy('order_number', 'desc')
                    ->lockForUpdate()
                    ->first();

                $nextSequence = $lastOrder ? (int) substr($lastOrder->order_number, -3) + 1 : 1;
                $orderNumber = $datePrefix.str_pad((string) $nextSequence, 3, '0', STR_PAD_LEFT);

                // LOGIKA FRONTDESK YANG SUPER SIMPEL & BEBAS PUSING
                $isTechnicianOnSite = $request->boolean('is_technician_on_site');
                $status = $isTechnicianOnSite ? ServiceStatus::APPROVED : ServiceStatus::WAITING_CHECKING;

                // Jika teknisi gada, pasti 0 dan unit ditinggal. Jika teknisi ada, ambil dari form.
                $estimatedCost = $isTechnicianOnSite ? ($request->estimated_cost ?? 0) : 0;
                $downPayment = $isTechnicianOnSite ? ($request->down_payment ?? 0) : 0;
                $isUnitLeftAtStore = $request->has('is_unit_left_at_store') ? $request->boolean('is_unit_left_at_store') : true;

                // Simpan Service Order
                return ServiceOrder::create([
                    'order_number' => $orderNumber,
                    'customer_id' => $customer->id,
                    'device_id' => $device->id,
                    'complaint' => $request->complaint,
                    'equipments' => $request->equipments,
                    'status' => $status,
                    'is_technician_on_site' => $isTechnicianOnSite,
                    'is_unit_left_at_store' => $isUnitLeftAtStore,
                    'estimated_cost' => $estimatedCost,
                    'down_payment' => $downPayment,
                    'created_by' => auth()->id(),
                ]);
            });

            $sendWa = $request->has('send_wa') ? $request->boolean('send_wa') : true;
            // Trigger Event untuk generate PDF dan Kirim WA secara antrean (Queued)
            ServiceOrderCreated::dispatch($serviceOrder, $sendWa);

            event(new ServiceOrderBroadcast($serviceOrder, 'created'));

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Servisan baru berhasil didaftarkan. Nota akan segera dikirim.',
            ]);

            return redirect()->route('services.index');
        } catch (\Exception $e) {
            Log::error('ServiceOrder Store Error: '.$e->getMessage());

            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal mendaftarkan servis. Silakan coba lagi.',
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
            'customer' => fn ($q) => $q->withTrashed(),
            'device' => fn ($q) => $q->withTrashed(),
            'createdBy:id,name',
            'technician:id,name',
            'handedOverBy:id,name',
            'warranty',
        ]);

        $recentServices = ServiceOrder::with(['customer', 'device'])
            ->where('id', '!=', $serviceOrder->id)
            ->whereNotIn('status', [ServiceStatus::TAKEN->value, ServiceStatus::CANCELLED->value])
            ->orderBy('updated_at', 'desc')
            ->limit(15)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'order_number' => $item->order_number,
                'customer_name' => $item->customer->name,
                'device_name' => $item->device->brand.' '.$item->device->model,
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

        // Validasi state machine telah dipindahkan ke UpdateServiceOrderRequest::after()

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

                if (array_key_exists('is_unit_left_at_store', $validated)) {
                    $updateData['is_unit_left_at_store'] = $validated['is_unit_left_at_store'];
                }
            } else {
                $updateData = [];
            }

            // B. UPDATE OPERASIONAL (Teknisi, Status, dan Biaya)
            if (in_array($newStatus, [ServiceStatus::IN_PROGRESS->value, ServiceStatus::COMPLETED->value]) && is_null($serviceOrder->technician_id)) {
                $updateData['technician_id'] = $user->id;
            }

            if (in_array($newStatus, [ServiceStatus::TAKEN->value, ServiceStatus::RETURNED->value])) {
                if (is_null($serviceOrder->handed_over_by)) {
                    $updateData['handed_over_by'] = $user->id;
                }
                // Otomatis tandai unit sudah tidak ada di toko jika sudah diserahkan/kembali
                $updateData['is_unit_left_at_store'] = false;
            }

            $updateData['status'] = $newStatus;

            if (array_key_exists('estimated_cost', $validated)) {
                $updateData['estimated_cost'] = $validated['estimated_cost'];
            }
            if (array_key_exists('final_cost', $validated)) {
                $updateData['final_cost'] = $validated['final_cost'];
            }
            if (array_key_exists('down_payment', $validated)) {
                $updateData['down_payment'] = $validated['down_payment'];
            }
            if (array_key_exists('technician_notes', $validated)) {
                $updateData['technician_notes'] = $validated['technician_notes'];
            }

            // Jika mulai dikerjakan (IN_PROGRESS), pastikan status lokasi unit OTOMATIS menjadi Di Toko (true)
            // Karena tidak mungkin dikerjakan kalau unitnya masih di rumah pelanggan.
            if ($newStatus === ServiceStatus::IN_PROGRESS->value) {
                $updateData['is_unit_left_at_store'] = true;
            }

            $serviceOrder->update($updateData);

            // Pemasukan ke Buku Besar jika ada pembayaran saat diambil (Khusus sukses/Taken atau Batal tapi ada Biaya Pengecekan)
            if (
                ($oldStatus !== ServiceStatus::TAKEN->value && $newStatus === ServiceStatus::TAKEN->value) ||
                ($oldStatus !== ServiceStatus::RETURNED->value && $newStatus === ServiceStatus::RETURNED->value)
            ) {
                $finalCost = $validated['final_cost'] ?? $serviceOrder->final_cost ?? $serviceOrder->estimated_cost ?? 0;
                $downPayment = $validated['down_payment'] ?? $serviceOrder->down_payment ?? 0;

                // Hanya catat transaksi jika finalCost > 0
                // Untuk "Taken" (Selesai), ini adalah Biaya Servis.
                // Untuk "Returned" (Batal), ini adalah Biaya Pengecekan (Checking Fee) jika toko menerapkannya.
                if ($finalCost > 0) {
                    $category = $newStatus === ServiceStatus::TAKEN->value ? TransactionCategory::FINAL_SERVICE : TransactionCategory::OTHER_INCOME;
                    $notesPrefix = $newStatus === ServiceStatus::TAKEN->value ? 'Pelunasan / Pembayaran Servis' : 'Biaya Pengecekan / Pembatalan Servis';

                    Transaction::create([
                        'service_order_id' => $serviceOrder->id,
                        'user_id' => auth()->id(),
                        'type' => TransactionType::INCOME,
                        'category' => $category,
                        'amount' => max(0, $finalCost),
                        'payment_method' => $request->input('payment_method', 'cash'),
                        'notes' => $notesPrefix . ' Nota: ' . $serviceOrder->order_number,
                        'transaction_date' => now(),
                    ]);
                }
            }

            event(new ServiceOrderBroadcast($serviceOrder, 'updated'));

            $sendWa = $request->has('send_wa') ? $request->boolean('send_wa') : true;

            // C. OTOMATISASI GARANSI (Hanya Dibuat Saat Unit Diambil/Dikembalikan Pertama Kali)
            if (! in_array($oldStatus, [ServiceStatus::TAKEN->value, ServiceStatus::RETURNED->value]) && in_array($newStatus, [ServiceStatus::TAKEN->value, ServiceStatus::RETURNED->value])) {

                if ($newStatus === ServiceStatus::RETURNED->value) {
                    $waMessage = WaGateway::getHandoverMessage($serviceOrder, 'returned');
                } else {
                    $isWarrantyClaim = str_starts_with($serviceOrder->complaint ?? '', 'KLAIM GARANSI');
                    $warrantyDays = $isWarrantyClaim ? 0 : (int) $request->input('warranty_days', 0);
                    $warrantyCode = null;

                    if ($warrantyDays > 0) {
                        $prefix = 'GAR-'.now()->format('Ymd').'-';
                        $lastWarranty = Warranty::where('warranty_code', 'like', $prefix.'%')
                            ->orderBy('warranty_code', 'desc')
                            ->lockForUpdate()
                            ->first();

                        $nextSeq = $lastWarranty ? (int) substr($lastWarranty->warranty_code, -3) + 1 : 1;
                        $warrantyCode = $prefix.str_pad((string) $nextSeq, 3, '0', STR_PAD_LEFT);

                        $serviceOrder->warranty()->create([
                            'warranty_code' => $warrantyCode,
                            'start_date' => now(),
                            'end_date' => now()->addDays($warrantyDays),
                            'status' => 'active',
                        ]);
                    }

                    $waMessage = WaGateway::getHandoverMessage($serviceOrder, 'taken', $isWarrantyClaim, $warrantyDays, $warrantyCode);
                }

                // Panggil WhatsApp API Gateway (melalui Job agar UI tidak lambat)
                SendFinalReceiptPdf::dispatch($serviceOrder, $waMessage, $sendWa);
            } elseif ($sendWa && $newStatus !== $oldStatus) {
                // D. JIKA BUKAN SERAH TERIMA TAPI ADA PERUBAHAN STATUS, DAN TOMBOL "SIMPAN & KIRIM WA" DITEKAN
                // Jika statusnya bukan "in_progress" (karena user tidak ingin spam di status ini), kirimkan notifikasinya.
                if ($newStatus === ServiceStatus::WAITING_APPROVAL->value) {
                    SendWaNotification::dispatch($serviceOrder, 'offer');
                } elseif ($newStatus === ServiceStatus::COMPLETED->value) {
                    SendWaNotification::dispatch($serviceOrder, 'update');
                }
            }
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Data nota '.$serviceOrder->order_number.' berhasil diperbarui.',
        ]);

        return back();
    }

    /**
     * Menghapus pesanan servis.
     */
    public function destroy(ServiceOrder $serviceOrder): RedirectResponse
    {
        if (! auth()->user()->hasRole('administrator')) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Hanya administrator yang dapat menghapus data servisan.']);

            return back();
        }

        // Mencegah penghapusan jika servis masih aktif diproses atau sudah selesai diambil
        $blockedStatuses = [
            ServiceStatus::IN_PROGRESS->value,
            ServiceStatus::COMPLETED->value,
            ServiceStatus::TAKEN->value,
            ServiceStatus::RETURNED->value,
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
        if (strlen((string) $phone) < 4) {
            return response()->json([]);
        }

        $customers = Customer::with('devices')->where('phone', 'like', "%{$phone}%")->limit(5)->get();

        return response()->json($customers);
    }

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

            $isWarranty = str_starts_with($serviceOrder->complaint ?? '', 'KLAIM GARANSI');
            if ($serviceOrder->estimated_cost <= 0 && ! $isWarranty) {
                Inertia::flash('toast', ['type' => 'error', 'message' => 'Gagal: Estimasi biaya harus diisi terlebih dahulu sebelum mengirim penawaran. (Kecuali klaim garansi)']);

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
     * Cetak PDF Nota Servis secara langsung (Stream).
     */
    public function printTicketPDF(ServiceOrder $serviceOrder): \Illuminate\Http\Response
    {
        $serviceOrder->load([
            'customer' => fn ($q) => $q->withTrashed(),
            'device' => fn ($q) => $q->withTrashed(),
            'createdBy:id,name',
            'technician:id,name',
            'handedOverBy:id,name',
            'warranty',
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
        $services = ServiceOrder::with(['customer', 'device', 'spareParts'])
            ->whereNotIn('status', [ServiceStatus::TAKEN->value, ServiceStatus::RETURNED->value])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(fn ($service) => [
                'id' => $service->id,
                'order_number' => $service->order_number,
                'customer_name' => $service->customer->name,
                'customer_phone' => $service->customer->phone,
                'device_name' => $service->device->brand.' '.$service->device->model,
                'complaint' => $service->complaint,
                'status' => $service->status->value,
                'status_label' => $service->status->label(),
                'estimated_cost' => $service->estimated_cost,
                'final_cost' => $service->final_cost,
                'down_payment' => $service->down_payment,
                'spare_parts' => $service->spareParts->map(fn ($sp) => [
                    'id' => $sp->id,
                    'name' => $sp->name,
                    'price' => $sp->pivot->price,
                    'quantity' => $sp->pivot->quantity,
                    'subtotal' => $sp->pivot->price * $sp->pivot->quantity,
                ]),
                'technician_notes' => $service->technician_notes,
                'is_unit_left_at_store' => $service->is_unit_left_at_store,
                'created_at' => $service->created_at->diffForHumans(),
            ]);

        return Inertia::render('services/kanban', [
            'services' => $services,
        ]);
    }

    /**
     * Memasukkan sparepart dari katalog ke dalam nota servis (Pivot).
     */
    public function attachSparepart(Request $request, ServiceOrder $serviceOrder): RedirectResponse
    {
        $request->validate([
            'spare_part_id' => 'required|exists:spare_parts,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $sparePart = SparePart::findOrFail($request->spare_part_id);
        $quantity = $request->quantity;

        DB::transaction(function () use ($serviceOrder, $sparePart, $quantity) {

            // Status barang (inden luar kota atau langsung pasang)
            $status = $sparePart->is_always_indent ? 'indenting' : 'installed';

            // Masukkan ke nota servis
            $serviceOrder->spareParts()->attach($sparePart->id, [
                'quantity' => $quantity,
                'price' => $sparePart->selling_price,
                'status' => $status,
            ]);

            // Kurangi fisik stok di katalog (Bisa jadi minus jika stok awal 0)
            if (! $sparePart->is_always_indent) {
                $sparePart->decrement('stock', $quantity);
            }
        });

        // CEK UNTUK NOTIFIKASI FRONTEND
        if (! $sparePart->is_always_indent && $sparePart->stock < $quantity) {
            // Beri notifikasi WARNING (Warna Kuning), tapi proses TETAP LANJUT
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => "Berhasil ditambahkan, TAPI stok {$sparePart->name} sekarang MINUS. Harap lapor Admin untuk merapikan pembukuan.",
            ]);
        } else {
            // Beri notifikasi SUCCESS normal
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "Berhasil menambahkan {$sparePart->name} ke dalam nota servis.",
            ]);
        }

        return back();
    }

    /**
     * Menghapus sparepart dari nota servis (Pivot) dan mengembalikan stok.
     */
    public function detachSparepart(Request $request, ServiceOrder $serviceOrder, $pivotId): RedirectResponse
    {
        $sparePart = $serviceOrder->spareParts()->wherePivot('id', $pivotId)->firstOrFail();
        $quantity = $sparePart->pivot->quantity;

        DB::transaction(function () use ($serviceOrder, $sparePart, $pivotId, $quantity) {
            // Hapus dari nota servis (khusus baris pivot ini saja jika ada duplikat sparepart)
            $serviceOrder->spareParts()->wherePivot('id', $pivotId)->detach($sparePart->id);

            // Kembalikan fisik stok di katalog jika bukan inden
            if (! $sparePart->is_always_indent) {
                $sparePart->increment('stock', $quantity);
            }
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Berhasil menghapus {$sparePart->name} dari nota servis.",
        ]);

        return back();
    }
}
