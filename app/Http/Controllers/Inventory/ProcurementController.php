<?php

namespace App\Http\Controllers\Inventory;

use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Models\SparePart;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProcurementController extends Controller
{
    /**
     * Menampilkan halaman riwayat pengadaan dan data sparepart untuk form modal.
     */
    public function index(Request $request): Response
    {
        // 1. Ambil riwayat uang keluar khusus untuk belanja stok (Kategori: BUY_SPAREPART)
        $query = Transaction::with('user:id,name')
            ->where('category', TransactionCategory::BUY_SPAREPART->value)
            ->latest('transaction_date');

        // Fitur Pencarian (Mencari berdasarkan catatan/nama supplier)
        if ($search = $request->search) {
            $query->where('notes', 'like', "%{$search}%");
        }

        $procurements = $query->paginate(10)->withQueryString();

        // 2. Ambil daftar sparepart untuk dropdown di Form Modal Pengadaan
        $spareparts = SparePart::select('id', 'name', 'sku', 'purchase_price', 'selling_price', 'stock')
            ->orderBy('name')
            ->get();

        return Inertia::render('inventory/procurement/list', [
            'procurements' => $procurements,
            'spareparts' => $spareparts,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Menyimpan transaksi pengadaan, mengupdate stok, dan harga terbaru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'spare_part_id' => ['required', 'exists:spare_parts,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'new_purchase_price' => ['required', 'numeric', 'min:0'],
            'new_selling_price' => ['required', 'numeric', 'min:0'],
            'total_expense' => ['required', 'numeric', 'min:0'],
            'supplier_note' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // 1. Cari data barang di master
                $sparepart = SparePart::findOrFail($validated['spare_part_id']);

                // 2. Catat pengeluaran uang di tabel transactions (Buku Besar)
                // Kita simpan detail barang yang dibeli di kolom 'notes'
                $catatanBelanja = "Belanja {$validated['quantity']} Pcs {$sparepart->name}. ";
                $catatanBelanja .= $validated['supplier_note'] ? "Supplier/Nota: {$validated['supplier_note']}" : '';

                Transaction::create([
                    'user_id' => auth()->id(), // Admin/Pegawai yang sedang login
                    'type' => TransactionType::EXPENSE,
                    'category' => TransactionCategory::BUY_SPAREPART,
                    'amount' => $validated['total_expense'],
                    'notes' => $catatanBelanja,
                    'transaction_date' => now(),
                    'payment_method' => 'cash', // Secara default diasumsikan ambil dari kasir/kas
                ]);

                // 3. Update stok dan harga master di tabel spare_parts
                // Stok lama ditambah stok baru masuk, harga ditimpa dengan harga terbaru dari form
                $sparepart->update([
                    'stock' => $sparepart->stock + $validated['quantity'],
                    'purchase_price' => $validated['new_purchase_price'],
                    'selling_price' => $validated['new_selling_price'],
                ]);
            });

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Pengadaan berhasil dicatat. Stok dan harga katalog telah diperbarui!',
            ]);

            return back();

        } catch (\Exception $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Terjadi kesalahan sistem saat memproses pengadaan: '.$e->getMessage(),
            ]);

            return back();
        }
    }
}
