<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use App\Models\ServiceOrder;
use App\Models\SparePart;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan halaman dashboard utama beserta ringkasan statistik.
     */
    public function index(Request $request): Response
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // 1. Keuangan (Pemasukan)
        $incomeToday = Transaction::where('type', TransactionType::INCOME)
            ->whereDate('transaction_date', $today)
            ->sum('amount');

        $incomeThisMonth = Transaction::where('type', TransactionType::INCOME)
            ->where('transaction_date', '>=', $thisMonth)
            ->sum('amount');

        // 2. Keuangan (Pengeluaran)
        $expenseToday = Transaction::where('type', TransactionType::EXPENSE)
            ->whereDate('transaction_date', $today)
            ->sum('amount');

        $expenseThisMonth = Transaction::where('type', TransactionType::EXPENSE)
            ->where('transaction_date', '>=', $thisMonth)
            ->sum('amount');

        // 3. Servis Aktif (Selain 'completed' / 'cancelled')
        $activeServicesCount = ServiceOrder::whereNotIn('status', ['completed', 'cancelled'])->count();

        // 4. Stok Sparepart Menipis (<= 5)
        $lowStockSpareparts = SparePart::where('stock', '<=', 5)
            ->orderBy('stock', 'asc')
            ->limit(5)
            ->get(['id', 'name', 'stock', 'sku']);

        return Inertia::render('dashboard', [
            'stats' => [
                'income' => [
                    'today' => $incomeToday,
                    'this_month' => $incomeThisMonth,
                ],
                'expense' => [
                    'today' => $expenseToday,
                    'this_month' => $expenseThisMonth,
                ],
                'active_services' => $activeServicesCount,
            ],
            'low_stock_spareparts' => $lowStockSpareparts,
        ]);
    }
}
