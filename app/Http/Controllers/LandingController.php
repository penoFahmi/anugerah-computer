<?php

namespace App\Http\Controllers;

use App\Enums\ProductStatus;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Public Landing Page Controller
 * Manages the public-facing website, including the homepage, catalog, and testimonials.
 * Requires no authentication.
 */
class LandingController extends Controller
{
    /**
     * Display the landing page with products.
     */
    public function index()
    {
        $products = Product::query()
            ->where('status', ProductStatus::READY)
            ->latest()
            ->take(6)
            ->get([
                'id',
                'name',
                'brand',
                'processor',
                'ram',
                'storage',
                'vga',
                'selling_price',
                'status',
                'image_path',
            ]);

        // We can map specs into a formatted string to keep frontend simpler,
        // or just pass raw data and let the frontend format it.
        $formattedProducts = $products->map(function ($product) {
            $specs = collect([$product->processor, $product->ram, $product->storage, $product->vga])
                ->filter()
                ->join(', ');

            return [
                'id' => $product->id,
                'name' => $product->name,
                'specs' => $specs ?: 'Spesifikasi tidak tersedia',
                'price' => 'Rp '.number_format((float) $product->selling_price, 0, ',', '.'),
                'status' => $product->status->value,
                'image' => $product->image_path ? asset('storage/' . $product->image_path) : null,
            ];
        });

        $store = \App\Models\StoreSetting::first();
        $testimonials = \App\Models\Testimonial::where('status', 'approved')->latest()->get();

        return Inertia::render('welcome', [
            'products' => $formattedProducts,
            'store' => $store,
            'testimonials' => $testimonials,
        ]);
    }

    /**
     * Display the catalog page with search, filters, and pagination.
     */
    public function catalog(Request $request)
    {
        $query = Product::query();

        // Filter: Search
        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('processor', 'like', "%{$search}%")
                  ->orWhere('ram', 'like', "%{$search}%")
                  ->orWhere('vga', 'like', "%{$search}%")
                  ->orWhere('storage', 'like', "%{$search}%");
            });
        }

        // Filter: Brand
        if ($request->filled('brand')) {
            $query->where('brand', $request->brand);
        }

        // Order by Status (READY first, then others) and Latest
        $products = $query->orderByRaw("
                CASE 
                    WHEN status = 'ready' THEN 1
                    WHEN status = 'booked' THEN 2
                    ELSE 3
                END
            ")
            ->latest()
            ->paginate(12)
            ->withQueryString();

        // Transform the collection items while keeping pagination intact
        $products->through(function ($product) {
            $specs = collect([$product->processor, $product->ram, $product->storage, $product->vga])
                ->filter()
                ->join(', ');

            return [
                'id' => $product->id,
                'name' => $product->name,
                'specs' => $specs ?: 'Spesifikasi tidak tersedia',
                'price' => 'Rp '.number_format((float) $product->selling_price, 0, ',', '.'),
                'status' => $product->status->value,
                'image' => $product->image_path ? asset('storage/' . $product->image_path) : null,
            ];
        });

        // Get unique brands for the filter dropdown
        $brands = Product::select('brand')
            ->distinct()
            ->whereNotNull('brand')
            ->pluck('brand');

        $store = \App\Models\StoreSetting::first();

        return Inertia::render('catalog', [
            'products' => $products,
            'brands' => $brands,
            'filters' => $request->only(['q', 'brand']),
            'store' => $store,
        ]);
    }
}
