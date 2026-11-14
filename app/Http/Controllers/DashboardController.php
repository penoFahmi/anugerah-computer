<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use App\Models\ServiceOrder;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Tampilkan halaman dashboard utama beserta ringkasan statistik dan arus kas filterable.
     * Mendukung filter periode: 'today' (hari ini), 'week' (minggu ini), 'month' (per bulan), 'year' (per tahun).
     */
    public function index(Request $request): Response
    {
        $period = $request->input('period', 'today');
        if (!in_array($period, ['today', 'week', 'month', 'year'])) {
            $period = 'today';
        }

        $now = Carbon::now();
        $today = Carbon::today();

        // 1. Tentukan rentang waktu berdasarkan periode yang dipilih
        switch ($period) {
            case 'today':
                $startDate = $today->copy()->startOfDay();
                $endDate = $today->copy()->endOfDay();
                $periodLabel = 'Hari Ini (' . $now->translatedFormat('d M Y') . ')';
                break;
            case 'week':
                // 7 hari terakhir hingga hari ini
                $startDate = $today->copy()->subDays(6)->startOfDay();
                $endDate = $today->copy()->endOfDay();
                $periodLabel = '7 Hari Terakhir (' . $startDate->translatedFormat('d M') . ' - ' . $endDate->translatedFormat('d M Y') . ')';
                break;
            case 'month':
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                $periodLabel = 'Bulan Ini (' . $now->translatedFormat('F Y') . ')';
                break;
            case 'year':
                $startDate = $now->copy()->startOfYear();
                $endDate = $now->copy()->endOfYear();
                $periodLabel = 'Tahun Ini (' . $now->translatedFormat('Y') . ')';
                break;
        }

        // 2. Hitung Pemasukan, Pengeluaran, dan Laba Bersih untuk Periode Terpilih
        $incomeSelected = (float) Transaction::where('type', TransactionType::INCOME)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');

        $expenseSelected = (float) Transaction::where('type', TransactionType::EXPENSE)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');

        $profitSelected = $incomeSelected - $expenseSelected;

        // 3. Susun Data Grafik Arus Kas Sesuai Periode
        $financeChartData = [];

        if ($period === 'today') {
            // Pengelompokan per jam operasional (08:00 sampai 21:00)
            $rawHourly = DB::table('transactions')
                ->select(
                    DB::raw('HOUR(transaction_date) as hour'),
                    DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
                    DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
                )
                ->whereDate('transaction_date', $today)
                ->groupBy(DB::raw('HOUR(transaction_date)'))
                ->get()
                ->keyBy('hour');

            for ($h = 8; $h <= 21; $h++) {
                $row = $rawHourly->get($h);
                $hourLabel = sprintf('%02d:00', $h);
                $financeChartData[] = [
                    'label' => $hourLabel,
                    'date' => $hourLabel,
                    'income' => (float) ($row->income ?? 0),
                    'expense' => (float) ($row->expense ?? 0),
                ];
            }
        } elseif ($period === 'week') {
            // 7 hari terakhir
            $rawDaily = DB::table('transactions')
                ->select(
                    DB::raw('DATE(transaction_date) as date'),
                    DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
                    DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
                )
                ->where('transaction_date', '>=', $startDate)
                ->where('transaction_date', '<=', $endDate)
                ->groupBy('date')
                ->get()
                ->keyBy('date');

            for ($i = 6; $i >= 0; $i--) {
                $dateObj = $today->copy()->subDays($i);
                $dateStr = $dateObj->toDateString();
                $row = $rawDaily->get($dateStr);
                $financeChartData[] = [
                    'label' => $dateObj->translatedFormat('D, d M'),
                    'date' => $dateStr,
                    'income' => (float) ($row->income ?? 0),
                    'expense' => (float) ($row->expense ?? 0),
                ];
            }
        } elseif ($period === 'month') {
            // Harian dalam bulan ini
            $rawMonthlyDays = DB::table('transactions')
                ->select(
                    DB::raw('DATE(transaction_date) as date'),
                    DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
                    DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
                )
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->groupBy('date')
                ->get()
                ->keyBy('date');

            $daysInMonth = $now->daysInMonth;
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $dateObj = Carbon::create($now->year, $now->month, $d);
                $dateStr = $dateObj->toDateString();
                $row = $rawMonthlyDays->get($dateStr);
                $financeChartData[] = [
                    'label' => (string) $d,
                    'date' => $dateStr,
                    'income' => (float) ($row->income ?? 0),
                    'expense' => (float) ($row->expense ?? 0),
                ];
            }
        } elseif ($period === 'year') {
            // 12 bulan dalam tahun ini
            $rawYearly = DB::table('transactions')
                ->select(
                    DB::raw('MONTH(transaction_date) as month'),
                    DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
                    DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
                )
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->groupBy(DB::raw('MONTH(transaction_date)'))
                ->get()
                ->keyBy('month');

            for ($m = 1; $m <= 12; $m++) {
                $monthObj = Carbon::create($now->year, $m, 1);
                $row = $rawYearly->get($m);
                $financeChartData[] = [
                    'label' => $monthObj->translatedFormat('M'),
                    'date' => $monthObj->format('Y-m'),
                    'income' => (float) ($row->income ?? 0),
                    'expense' => (float) ($row->expense ?? 0),
                ];
            }
        }

        // 4. Servis Aktif (Selain 'completed', 'cancelled', 'returned', 'taken')
        $activeServicesCount = ServiceOrder::whereNotIn('status', ['completed', 'cancelled', 'returned', 'taken'])->count();

        // 5. Data Grafik Status Servis
        $serviceChartData = DB::table('service_orders')
            ->select('status', DB::raw('count(*) as count'))
            ->whereNull('deleted_at')
            ->groupBy('status')
            ->get();

        return Inertia::render('dashboard', [
            'period' => $period,
            'period_label' => $periodLabel,
            'stats' => [
                'income' => $incomeSelected,
                'expense' => $expenseSelected,
                'profit' => $profitSelected,
                'active_services' => $activeServicesCount,
            ],
            'chart_data' => [
                'finance' => $financeChartData,
                'services' => $serviceChartData,
            ],
        ]);
    }
}
