<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SparePartApiController extends Controller
{
    /**
     * Endpoint untuk mencari sparepart secara dinamis (Async Select).
     * Mencegah payload data raksasa di initial load Inertia.
     */
    public function search(Request $request): JsonResponse
    {
        $search = $request->query('q', '');

        $query = SparePart::select('id', 'name', 'selling_price', 'stock', 'is_always_indent');

        if (! empty($search)) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%");
        }

        // Batasi hasil maksimal 30 agar respons selalu cepat
        $spareparts = $query->limit(30)->get();

        return response()->json($spareparts);
    }
}
