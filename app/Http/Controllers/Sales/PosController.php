<?php

namespace App\Http\Controllers\Sales;

use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Models\PosTransaction;
use App\Models\PosTransactionItem;
use App\Models\Product;
use App\Models\SparePart;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Point of Sale (POS) Controller
 * Handles retail transactions for both spare parts and products (laptops/PCs).
 * Ensures atomicity of transactions using database transactions.
 */
class PosController extends Controller
{
    /**
     * Menampilkan antarmuka Kasir (POS).
     */
    public function index(): Response
    {
        return Inertia::render('sales/pos/list');
    }

    /**
     * Memproses pembayaran dan memotong stok.
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Validasi keranjang belanja dan pembayaran dari React
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'cart_items' => 'required|array|min:1',
            'cart_items.*.type' => 'required|in:sparepart,product',
            'cart_items.*.id' => 'required|integer',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'cart_items.*.price' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'final_amount' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
        ]);

        // Cek apakah uang yang dibayar cukup
        if ($validated['paid_amount'] < $validated['final_amount']) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Uang pembayaran kurang dari total belanja!',
            ]);

            return back();
        }

        try {
            // 2. Buat Nomor Invoice Otomatis (Contoh: INV-20260717-XYZ)
            $invoiceNumber = 'INV-'.date('Ymd').'-'.strtoupper(Str::random(5));

            $pos = DB::transaction(function () use ($validated, $invoiceNumber) {

                // 3. Simpan Master Nota (PosTransaction)
                $pos = PosTransaction::create([
                    'invoice_number' => $invoiceNumber,
                    'user_id' => auth()->id(), // Kasir yang bertugas
                    'customer_id' => $validated['customer_id'] ?? null,
                    'total_amount' => $validated['total_amount'],
                    'discount' => $validated['discount'],
                    'final_amount' => $validated['final_amount'],
                    'paid_amount' => $validated['paid_amount'],
                    'payment_method' => $validated['payment_method'],
                ]);

                // 4. Proses setiap barang di dalam keranjang
                foreach ($validated['cart_items'] as $item) {
                    $subtotal = $item['quantity'] * $item['price'];

                    if ($item['type'] === 'sparepart') {
                        // Jika yang dibeli adalah aksesoris/sparepart
                        PosTransactionItem::create([
                            'pos_transaction_id' => $pos->id,
                            'spare_part_id' => $item['id'],
                            'quantity' => $item['quantity'],
                            'price' => $item['price'], // Snapshot harga
                            'subtotal' => $subtotal,
                        ]);
                        // Kurangi stok fisik gudang
                        SparePart::where('id', $item['id'])->decrement('stock', $item['quantity']);
                    } elseif ($item['type'] === 'product') {
                        // Jika yang dibeli adalah Laptop
                        PosTransactionItem::create([
                            'pos_transaction_id' => $pos->id,
                            'product_id' => $item['id'],
                            'quantity' => 1, // Laptop selalu beli 1 per data
                            'price' => $item['price'],
                            'subtotal' => $subtotal,
                        ]);
                        // Ubah status laptop menjadi terjual
                        Product::where('id', $item['id'])->update(['status' => 'sold']);
                    }
                }

                // 5. Catat Pemasukan ke Buku Besar Keuangan (Transactions)
                Transaction::create([
                    'pos_transaction_id' => $pos->id,
                    'user_id' => auth()->id(),
                    'type' => TransactionType::INCOME,
                    'category' => TransactionCategory::POS_RETAIL,
                    'amount' => $validated['final_amount'],
                    'payment_method' => $validated['payment_method'],
                    'notes' => 'Penjualan Kasir POS dengan No Invoice: '.$invoiceNumber,
                    'transaction_date' => now(),
                ]);

                return $pos;
            });

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Transaksi berhasil dibayar dan dicatat!',
            ]);

            Inertia::flash('invoice_data', [
                'invoice_number' => $invoiceNumber,
                'total_amount' => $pos->total_amount,
                'discount' => $pos->discount,
                'final_amount' => $pos->final_amount,
                'paid_amount' => $pos->paid_amount,
                'change' => max(0, $pos->paid_amount - $pos->final_amount),
                'items' => collect($validated['cart_items'])->map(function ($item) {
                    return [
                        'name' => $item['name'] ?? 'Item',
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                        'subtotal' => $item['quantity'] * $item['price'],
                    ];
                })->toArray(),
            ]);

            return back();

        } catch (\Exception $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Terjadi kesalahan sistem: '.$e->getMessage(),
            ]);

            return back();
        }
    }
}
