<?php

namespace App\Http\Controllers;

use App\Models\SparePart;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SparePartController extends Controller
{
    /**
     * Menampilkan daftar master stok sparepart (Katalog Gudang).
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'stock_status', 'type', 'per_page']);
        $perPage = $filters['per_page'] ?? '15';
        $limit = $perPage === 'all' ? 500 : (int) $perPage;

        $query = SparePart::query();

        // Pencarian berdasarkan Nama atau SKU
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter status stok (Tersedia, Habis, atau khusus Inden)
        if (!empty($filters['stock_status']) && $filters['stock_status'] !== 'all') {
            match ($filters['stock_status']) {
                'in_stock' => $query->where('stock', '>', 0),
                'out_of_stock' => $query->where('stock', '<=', 0)->where('is_always_indent', false),
                'indent_only' => $query->where('is_always_indent', true),
                default => null,
            };
        }

        $spareparts = $query->latest('id')->paginate($limit)->withQueryString();

        // Mapping data untuk kebutuhan Frontend
        $spareparts->through(function ($item) {
            return [
                'id' => $item->id,
                'sku' => $item->sku ?? '-',
                'name' => $item->name,
                'purchase_price' => $item->purchase_price,
                'selling_price' => $item->selling_price,
                'stock' => $item->stock,
                'is_always_indent' => $item->is_always_indent,
                'profit_margin' => $item->selling_price - $item->purchase_price,
                'updated_at' => $item->updated_at->format('d M Y, H:i'),
            ];
        });

        return Inertia::render('inventory/spareparts/list', [
            'spareparts' => $spareparts,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'stock_status' => $filters['stock_status'] ?? 'all',
                'per_page' => $perPage,
            ]
        ]);
    }

    /**
     * Menyimpan data sparepart baru ke katalog.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validasi langsung menggunakan Request karena formnya sederhana
        $validated = $request->validate([
            'sku' => 'nullable|string|max:50|unique:spare_parts,sku',
            'name' => 'required|string|max:255',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_always_indent' => 'boolean',
        ]);

        try {
            SparePart::create([
                'sku' => $validated['sku'],
                'name' => $validated['name'],
                'purchase_price' => $validated['purchase_price'],
                'selling_price' => $validated['selling_price'],
                'stock' => $validated['stock'],
                'is_always_indent' => $validated['is_always_indent'] ?? false,
            ]);

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "Barang '{$validated['name']}' berhasil ditambahkan ke katalog."
            ]);

            return back();
        } catch (\Exception $e) {
            Log::error('SparePart Store Error: ' . $e->getMessage());

            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal menyimpan data barang. Silakan coba lagi.'
            ]);
            
            return back()->withInput();
        }
    }

    /**
     * Memperbarui data sparepart yang sudah ada.
     */
    public function update(Request $request, SparePart $sparePart): RedirectResponse
    {
        $validated = $request->validate([
            'sku' => 'nullable|string|max:50|unique:spare_parts,sku,' . $sparePart->id,
            'name' => 'required|string|max:255',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_always_indent' => 'boolean',
        ]);

        try {
            $sparePart->update($validated);

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "Data barang '{$sparePart->name}' berhasil diperbarui."
            ]);

            return back();
        } catch (\Exception $e) {
            Log::error('SparePart Update Error: ' . $e->getMessage());

            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal memperbarui data barang.'
            ]);

            return back();
        }
    }

    /**
     * Menghapus sparepart dari katalog (Soft Delete).
     */
    public function destroy(SparePart $sparePart): RedirectResponse
    {
        // Hanya Admin yang boleh menghapus Master Data
        if (!auth()->user()->hasRole('administrator')) {
            Inertia::flash('toast', [
                'type' => 'error', 
                'message' => 'Hanya administrator yang dapat menghapus data katalog barang.'
            ]);
            return back();
        }

        $name = $sparePart->name;
        $sparePart->delete();

        Inertia::flash('toast', [
            'type' => 'info', 
            'message' => "Barang '{$name}' telah dihapus dari sistem."
        ]);
        
        return back();
    }

    /**
     * API: Mencari sparepart secara real-time (Untuk Dropdown di Modal Servis & POS).
     */
    public function searchApi(Request $request): JsonResponse
    {
        $search = $request->query('query');
        
        // Return kosong jika kurang dari 2 karakter untuk menghemat beban query database
        if (strlen((string) $search) < 2) {
            return response()->json([]);
        }

        $parts = SparePart::where('name', 'like', "%{$search}%")
            ->orWhere('sku', 'like', "%{$search}%")
            ->limit(10)
            ->get(['id', 'sku', 'name', 'selling_price', 'stock', 'is_always_indent']);

        return response()->json($parts);
    }
}