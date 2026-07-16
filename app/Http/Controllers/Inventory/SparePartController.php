<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class SparePartController extends Controller
{
    public function index(Request $request)
    {
        $query = SparePart::query();

        // 1. Filter Pencarian (Nama atau SKU)
        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // 2. Filter Ketersediaan Stok
        if ($filterStock = $request->filter_stock) {
            match ($filterStock) {
                'available' => $query->where('stock', '>', 0),
                'empty' => $query->where('stock', '<=', 0),
                default => null
            };
        }

        // 3. Filter Sifat Barang
        if ($filterType = $request->filter_type) {
            match ($filterType) {
                'ready' => $query->where('is_always_indent', false),
                'indent' => $query->where('is_always_indent', true),
                default => null
            };
        }

        $spareparts = $query->latest('id')->paginate(10)->withQueryString();

        return Inertia::render('inventory/spareparts/list', [
            'spareparts' => $spareparts,
            'filters' => $request->only(['search', 'filter_stock', 'filter_type']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => ['nullable', 'string', 'max:50', 'unique:spare_parts,sku'],
            'name' => ['required', 'string', 'max:255'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'is_always_indent' => ['boolean'],
        ]);

        SparePart::create($validated);

        return back()->with('toast', [
            'type' => 'success', 
            'message' => 'Sparepart baru berhasil ditambahkan ke katalog.'
        ]);
    }

    public function update(Request $request, SparePart $sparepart)
    {
        $validated = $request->validate([
            'sku' => ['nullable', 'string', 'max:50', Rule::unique('spare_parts', 'sku')->ignore($sparepart->id)],
            'name' => ['required', 'string', 'max:255'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'is_always_indent' => ['boolean'],
        ]);

        $sparepart->update($validated);

        return back()->with('toast', [
            'type' => 'success', 
            'message' => 'Data sparepart berhasil diperbarui.'
        ]);
    }

    public function destroy(SparePart $sparepart)
    {
        // Pengecekan keamanan: Jangan hapus jika stok masih ada
        if ($sparepart->stock > 0) {
            return back()->with('toast', [
                'type' => 'error', 
                'message' => 'Tidak dapat menghapus barang yang masih memiliki stok fisik.'
            ]);
        }

        $sparepart->delete();

        return back()->with('toast', [
            'type' => 'info', 
            'message' => 'Sparepart telah dihapus dari katalog.'
        ]);
    }
}