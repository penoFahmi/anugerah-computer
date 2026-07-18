<?php

namespace App\Http\Controllers;

use App\Enums\ProductStatus;
use App\Models\Product;
use Inertia\Inertia;

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
            ];
        });

        return Inertia::render('welcome', [
            'products' => $formattedProducts,
        ]);
    }
}
