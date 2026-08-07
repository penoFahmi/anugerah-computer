<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductApiController extends Controller
{
    /**
     * Pencarian produk (Laptop/PC) secara asinkron (AJAX)
     * Limit otomatis 30 untuk optimasi performa.
     */
    public function search(Request $request): JsonResponse
    {
        $search = $request->query('q', '');

        $query = Product::where('status', 'ready')
            ->select('id', 'slug', 'name', 'selling_price', 'image_path', 'ram', 'storage');

        if (! empty($search)) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%");
        }

        // Batasi hasil maksimal 30 agar respons selalu cepat
        $products = $query->limit(30)->get();

        return response()->json($products);
    }
}
