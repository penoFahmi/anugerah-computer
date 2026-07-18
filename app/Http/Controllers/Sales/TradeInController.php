<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TradeInController extends Controller
{
    /**
     * Display a listing of the purchase orders (Trade In).
     */
    public function index(Request $request): Response
    {
        $query = PurchaseOrder::with(['customer', 'user'])->latest();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('item_name', 'like', "%{$search}%")
                ->orWhere('purchase_number', 'like', "%{$search}%")
                ->orWhereHas('customer', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        $tradeIns = $query->paginate(10)->withQueryString();

        return Inertia::render('sales/trade-in/list', [
            'tradeIns' => $tradeIns,
            'filters' => $request->only(['search']),
        ]);
    }
}
