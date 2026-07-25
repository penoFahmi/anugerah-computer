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

        // 5. Servis Terbaru (5 terakhir)
        $recentServices = ServiceOrder::with(['customer:id,name', 'device:id,brand,model'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'order_number', 'customer_id', 'device_id', 'status', 'created_at']);

        // 6. Data Grafik Status Servis
        $serviceChartData = \Illuminate\Support\Facades\DB::table('service_orders')
            ->select('status', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
            ->whereNull('deleted_at')
            ->groupBy('status')
            ->get();

        // 7. Data Grafik Tren Keuangan (7 Hari Terakhir)
        $sevenDaysAgo = Carbon::today()->subDays(6);
        $financeChartData = \Illuminate\Support\Facades\DB::table('transactions')
            ->select(
                \Illuminate\Support\Facades\DB::raw('DATE(transaction_date) as date'),
                \Illuminate\Support\Facades\DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
                \Illuminate\Support\Facades\DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
            )
            ->whereDate('transaction_date', '>=', $sevenDaysAgo)
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

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
            'recent_services' => $recentServices,
            'chart_data' => [
                'services' => $serviceChartData,
                'finance' => $financeChartData,
            ],
        ]);
    }
}
