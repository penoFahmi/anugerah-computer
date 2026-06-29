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
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\WaGateway;
use Barryvdh\DomPDF\Facade\Pdf;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Notification;
use App\Notifications\NewServiceOrderNotification;

class ServiceOrderController extends Controller
{
    /**
     * 1. INDEX: Menampilkan halaman utama daftar servisan
     */
    public function index(Request $request)
    {
        // Ambil semua filter dari URL (React akan mengirimkan ini via parameter)
        $filters = $request->only(['search', 'status', 'date', 'type', 'per_page']);
        $perPage = $filters['per_page'] ?? 10;

        // Mulai Query dengan relasi yang dibutuhkan
        $query = ServiceOrder::query()->with([
            'customer' => fn($q) => $q->withTrashed(),
            'device' => fn($q) => $q->withTrashed(),
        ]);

        // Filter 1: Pencarian (Nama, No HP, No Nota)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $cleanSearch = preg_replace('/[^0-9]/', '', $search);

            // Logika ubah awalan 0 jadi 62 untuk pencarian
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

        // Filter 2: Tanggal
        if (!empty($filters['date'])) {
            match ($filters['date']) {
                'today' => $query->whereDate('created_at', today()),
                'this_week' => $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]),
                'this_month' => $query->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year),
                default => null,
            };
        }

        // Filter 3: Tipe Perangkat (Laptop/PC/Printer)
        if (!empty($filters['type']) && in_array($filters['type'], ['laptop', 'pc', 'printer'])) {
            $query->whereHas('device', fn($q) => $q->where('device_type', $filters['type']));
        }

        // Filter 4: Status Servis
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Eksekusi Query dengan Pagination
        $services = $query->latest()->paginate($perPage)->withQueryString();

        // Format data agar lebih ringan dikirim ke React Inertia
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

        // Lempar ke Frontend
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
     * 2. STORE: Menyimpan data servisan BARU
     */
    public function store(StoreServiceOrderRequest $request)
    {
        try {
            // Gunakan Transaction. Kalau ada error di tengah jalan, DB akan di-rollback!
            $serviceOrder = DB::transaction(function () use ($request) {

                // A. Cari pelanggan lama, atau buat baru kalau belum ada
                $customer = Customer::firstOrCreate(
                    ['phone' => $request->phone],
                    ['name' => $request->name ?? 'Tanpa Nama']
                );

                // B. Daftarkan Perangkat (Device)
                if ($request->device_id) {
                    $device = Device::findOrFail($request->device_id);
                } else {
                    $device = $customer->devices()->create([
                        'device_type' => $request->device_type ?? 'Laptop',
                        'brand' => $request->brand,
                        'model' => $request->model,
                    ]);
                }

                // C. Generate Nomor Antrean/Nota Aman dari Duplikat
                $datePrefix = 'SRV-' . now()->format('Ymd') . '-';

                $lastOrder = ServiceOrder::where('order_number', 'like', $datePrefix . '%')
                    ->orderBy('order_number', 'desc')
                    ->lockForUpdate() // Kunci DB sedetik agar tidak ada tabrakan nomor antrean
                    ->first();

                $nextSequence = $lastOrder ? (int) substr($lastOrder->order_number, -3) + 1 : 1;
                $orderNumber = $datePrefix . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);

                // D. Tentukan status awal
                $status = $request->is_technician_on_site
                    ? ServiceStatus::APPROVED
                    : ServiceStatus::WAITING_CHECKING;

                // E. Simpan Servisan ke Database
                return ServiceOrder::create([
                    'order_number' => $orderNumber,
                    'customer_id' => $customer->id,
                    'device_id' => $device->id,
                    'complaint' => $request->complaint,
                    'equipments' => $request->equipments, // otomatis jadi JSON
                    'status' => $status,
                    'is_technician_on_site' => $request->is_technician_on_site ?? false,
                    'estimated_cost' => $request->estimated_cost ?? 0,
                    'down_payment' => $request->down_payment ?? 0,
                    'created_by' => auth()->id(),
                ]);
            });

            // F. Jalankan Event (Bikin PDF & Kirim WA di Background)
            ServiceOrderCreated::dispatch($serviceOrder);

             // =======================================================
            // G. KIRIM NOTIFIKASI KE TEKNISI DAN ADMIN LAIN
            // =======================================================
            // Cari user yang jabatannya teknisi atau administrator, KECUALI yang sedang login (bikin servisan)
            $usersToNotify = User::role(['teknisi', 'administrator'])
                ->where('id', '!=', auth()->id())
                ->get();

            Notification::send(
                $usersToNotify, 
                new NewServiceOrderNotification($serviceOrder, auth()->user()->name)
            );

            // G. Beri Notifikasi Sukses ke React
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
     * 3. SHOW: Menampilkan halaman detail full & Navigasi Cepat
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

        // AMBIL DATA NAVIGASI CEPAT (15 Servisan terakhir yang masih aktif)
        $recentServices = ServiceOrder::with(['customer', 'device'])
            ->where('id', '!=', $serviceOrder->id) // Kecualikan yang sedang dibuka
            ->whereNotIn('status', ['taken', 'cancelled']) // Sembunyikan yang sudah diambil/batal
            ->orderBy('updated_at', 'desc') // Urutkan dari yang terakhir diutak-atik
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
            'recentServices' => $recentServices, // Kirim ke React
        ]);
    }

/**
     * 4. UPDATE: Menyimpan Form Proses atau Form Edit Lengkap
     */
    public function update(UpdateServiceOrderRequest $request, ServiceOrder $serviceOrder)
    {
        $validated = $request->validated();
        $user = auth()->user();

        DB::transaction(function () use ($validated, $request, $serviceOrder, $user) {
            
            // A. UPDATE PENUH (Hanya diproses jika form lengkap dan user adalah Admin/Pegawai)
            if ($request->boolean('is_full_update') && $user->hasAnyRole(['administrator', 'pegawai'])) {
                
                // 1. Update Data Pelanggan
                $serviceOrder->customer->update([
                    'name' => $validated['name'],
                    'phone' => $validated['phone'], // Mutator 628 otomatis berjalan
                ]);

                // 2. Update Data Perangkat
                $serviceOrder->device->update([
                    'device_type' => $validated['device_type'] ?? 'Laptop',
                    'brand' => $validated['brand'],
                    'model' => $validated['model'],
                ]);

                // 3. Siapkan data Keluhan & Kelengkapan untuk diupdate ke tabel ServiceOrder
                $updateData = [
                    'complaint' => $validated['complaint'],
                    'equipments' => $validated['equipments'] ?? [],
                ];
            } else {
                $updateData = [];
            }

            // B. UPDATE OPERASIONAL (Berlaku untuk semua Role, termasuk Teknisi)
            
            // Auto-assign ID Teknisi jika status berubah jadi dikerjakan/selesai
            if (in_array($validated['status'], [ServiceStatus::IN_PROGRESS->value, ServiceStatus::COMPLETED->value]) && is_null($serviceOrder->technician_id)) {
                $updateData['technician_id'] = $user->id;
            }

            // Auto-assign ID Kasir penyerah jika status diambil
            if ($validated['status'] === ServiceStatus::TAKEN->value && is_null($serviceOrder->handed_over_by)) {
                $updateData['handed_over_by'] = $user->id;
            }

            // Gabungkan data operasional ke array update
            $updateData['status'] = $validated['status'];
            
            // Jika form mengirimkan estimated_cost, gunakan itu. Jika tidak, pertahankan yang lama.
            if (array_key_exists('estimated_cost', $validated)) {
                $updateData['estimated_cost'] = $validated['estimated_cost'];
            }
            
            if (array_key_exists('technician_notes', $validated)) {
                $updateData['technician_notes'] = $validated['technician_notes'];
            }

            $serviceOrder->update($updateData);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Data nota ' . $serviceOrder->order_number . ' berhasil diperbarui.'
        ]);

        return redirect()->back();
    }

    /**
     * DESTROY: Hanya administrator
     */
    public function destroy(ServiceOrder $serviceOrder)
    {
        // Cek role dulu
        if (!auth()->user()->hasRole('administrator')) {
            Inertia::flash('toast', [
                'type'    => 'error',
                'message' => 'Hanya administrator yang dapat menghapus data servisan.',
            ]);
            return redirect()->back();
        }

        // Guard status
        $blockedStatuses = [
            ServiceStatus::IN_PROGRESS->value,
            ServiceStatus::COMPLETED->value,
            ServiceStatus::TAKEN->value,
        ];

        if (in_array($serviceOrder->status->value, $blockedStatuses)) {
            Inertia::flash('toast', [
                'type'    => 'error',
                'message' => 'Servisan yang sedang diproses atau sudah selesai tidak dapat dihapus.',
            ]);
            return redirect()->back();
        }

        $orderNumber = $serviceOrder->order_number;
        $serviceOrder->delete();

        Inertia::flash('toast', [
            'type'    => 'info',
            'message' => "Servisan {$orderNumber} telah dihapus.",
        ]);

        return redirect()->route('services.index');
    }

    /**
     * 6. API: Autocomplete Nomor HP Pelanggan Lama
     */
    public function searchCustomer(Request $request)
    {
        $phone = $request->query('phone');

        // Baru cari ke DB kalau user udah ngetik minimal 4 angka
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
     * 7. CUSTOM ACTION: Kirim Penawaran Harga WA ke Pelanggan
     */
    public function triggerWhatsappOffer(Request $request, ServiceOrder $serviceOrder)
    {
        // Validasi: Harga gak boleh 0 atau kosong
        if ($serviceOrder->estimated_cost <= 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal: Estimasi biaya harus diisi terlebih dahulu sebelum mengirim penawaran.'
            ]);
            return redirect()->back();
        }

        // Ubah Status
        $serviceOrder->update(['status' => ServiceStatus::WAITING_APPROVAL]);

        // Tembak Gateway WhatsApp
        WaGateway::sendOffer($serviceOrder);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Penawaran WA terkirim! Sistem AI kini siaga menunggu balasan pelanggan.'
        ]);

        return redirect()->back();
    }

    public function printTicketPDF(ServiceOrder $serviceOrder)
    {
        // Load data relasi yang dibutuhkan untuk dicetak di PDF
        $serviceOrder->load([
            'customer' => fn($q) => $q->withTrashed(),
            'device' => fn($q) => $q->withTrashed(),
            'createdBy:id,name',
            'technician:id,name'
        ]);

        // Generate PDF menggunakan view 'pdf.service_receipt'
        $pdf = Pdf::loadView('pdf.service_receipt', ['order' => $serviceOrder]);

        // Gunakan stream() agar PDF terbuka di tab baru browser, 
        // atau ganti jadi download() jika ingin langsung terunduh.
        return $pdf->stream("nota-{$serviceOrder->order_number}.pdf");
    }
}
