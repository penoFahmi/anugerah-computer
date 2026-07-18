<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query();

        // 1. Filter Pencarian (Nama Laptop atau Brand)
        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        // 2. Filter Status Ketersediaan
        if ($filterStatus = $request->filter_status) {
            if ($filterStatus !== 'all') {
                $query->where('status', $filterStatus);
            }
        }

        $products = $query->latest('id')->paginate(10)->withQueryString();

        return Inertia::render('inventory/products/list', [
            'products' => $products,
            'filters' => $request->only(['search', 'filter_status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:50'],
            'processor' => ['nullable', 'string', 'max:100'],
            'ram' => ['nullable', 'string', 'max:50'],
            'storage' => ['nullable', 'string', 'max:100'],
            'vga' => ['nullable', 'string', 'max:100'],
            'condition_notes' => ['nullable', 'string'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'warranty_days' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'string', 'in:ready,booked,sold'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'], // Maksimal 2MB
        ]);

        // Buat slug otomatis dari nama laptop
        $validated['slug'] = Str::slug($validated['name']).'-'.time();

        // Logika Upload Gambar
        if ($request->hasFile('image')) {
            // Simpan gambar ke folder 'public/products'
            $validated['image_path'] = $request->file('image')->store('products', 'public');
        }

        Product::create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Katalog laptop berhasil ditambahkan.',
        ]);

        return back();
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:50'],
            'processor' => ['nullable', 'string', 'max:100'],
            'ram' => ['nullable', 'string', 'max:50'],
            'storage' => ['nullable', 'string', 'max:100'],
            'vga' => ['nullable', 'string', 'max:100'],
            'condition_notes' => ['nullable', 'string'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'warranty_days' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'string', 'in:ready,booked,sold'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        // Jika nama berubah, update slug
        if ($product->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']).'-'.time();
        }

        // Logika Ganti Gambar
        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            // Simpan gambar baru
            $validated['image_path'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Data laptop berhasil diperbarui.',
        ]);

        return back();
    }

    public function destroy(Product $product): RedirectResponse
    {
        // Pengecekan keamanan, jangan hapus jika sedang di-booking atau sudah terjual
        if ($product->status->value !== 'ready') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Tidak dapat menghapus laptop yang sudah dibooking atau terjual.',
            ]);

            return back();
        }

        // Hapus file gambar dari storage server
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        Inertia::flash('toast', [
            'type' => 'info',
            'message' => 'Data laptop telah dihapus dari katalog.',
        ]);

        return back();
    }
}
