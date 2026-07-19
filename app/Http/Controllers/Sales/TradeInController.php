<?php

namespace App\Http\Controllers\Sales;

use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\PurchaseOrder;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    /**
     * Menyimpan data pembelian laptop second (Trade-In).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'name' => ['required', 'string', 'max:255'],
            'item_name' => ['required', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'specification_summary' => ['required', 'string'],
            'condition_notes' => ['required', 'string'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // 1. Buat atau ambil Pelanggan berdasarkan nomor HP
                $customer = Customer::firstOrCreate(
                    ['phone' => $validated['phone']],
                    ['name' => $validated['name']]
                );

                // 2. Generate Nomor Pembelian Otomatis
                $datePrefix = 'TRD-'.now()->format('Ymd').'-';
                $lastOrder = PurchaseOrder::where('purchase_number', 'like', $datePrefix.'%')
                    ->orderBy('purchase_number', 'desc')
                    ->lockForUpdate()
                    ->first();

                $nextSequence = $lastOrder ? (int) substr($lastOrder->purchase_number, -4) + 1 : 1;
                $purchaseNumber = $datePrefix.str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);

                // 3. Simpan data Purchase Order
                $purchaseOrder = PurchaseOrder::create([
                    'purchase_number' => $purchaseNumber,
                    'customer_id' => $customer->id,
                    'item_name' => $validated['item_name'],
                    'serial_number' => $validated['serial_number'],
                    'specification_summary' => $validated['specification_summary'],
                    'condition_notes' => $validated['condition_notes'],
                    'purchase_price' => $validated['purchase_price'],
                    'user_id' => auth()->id(),
                ]);

                // 4. Catat pengeluaran uang di tabel transactions (Buku Besar)
                Transaction::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'user_id' => auth()->id(),
                    'type' => TransactionType::EXPENSE,
                    'category' => TransactionCategory::TRADE_IN,
                    'amount' => $validated['purchase_price'],
                    'notes' => "Pembelian unit {$validated['item_name']} dari {$customer->name} (No: {$purchaseNumber})",
                    'transaction_date' => now(),
                    'payment_method' => 'cash',
                ]);
            });

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Pembelian bekas berhasil dicatat dan memotong kas toko!',
            ]);

            return back();

        } catch (\Exception $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Terjadi kesalahan sistem: '.$e->getMessage(),
            ]);

            return back()->withInput();
        }
    }
}
