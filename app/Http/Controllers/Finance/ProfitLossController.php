<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfitLossController extends Controller
{
    /**
     * Display the Profit & Loss report.
     */
    public function index(Request $request): Response
    {
        $year = $request->get('year', Carbon::now()->year);

        // Group by month
        $reports = Transaction::select(
            DB::raw('MONTH(transaction_date) as month'),
            DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
            DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
        )
            ->whereYear('transaction_date', $year)
            ->groupBy(DB::raw('MONTH(transaction_date)'))
            ->orderBy('month', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::create()->month($item->month)->translatedFormat('F'),
                    'month_number' => $item->month,
                    'income' => (float) $item->income,
                    'expense' => (float) $item->expense,
                    'profit' => (float) ($item->income - $item->expense),
                ];
            });

        return Inertia::render('finance/profit-loss/report', [
            'reports' => $reports,
            'year' => (int) $year,
        ]);
    }
}
