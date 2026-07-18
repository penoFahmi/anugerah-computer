<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashflowController extends Controller
{
    /**
     * Display a listing of daily cashflow transactions.
     */
    public function index(Request $request): Response
    {
        $query = Transaction::with(['user'])->latest('transaction_date');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('notes', 'like', "%{$search}%");
        }

        if ($request->has('type') && $request->get('type') !== 'all') {
            $query->where('type', $request->get('type'));
        }

        if ($request->has('date')) {
            $date = Carbon::parse($request->get('date'));
            $query->whereDate('transaction_date', $date);
        }

        $transactions = $query->paginate(15)->withQueryString();

        $today = Carbon::today();
        $summary = [
            'income_today' => Transaction::incomes()->whereDate('transaction_date', $today)->sum('amount'),
            'expense_today' => Transaction::expenses()->whereDate('transaction_date', $today)->sum('amount'),
        ];

        return Inertia::render('finance/cashflow/list', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['search', 'type', 'date']),
        ]);
    }
}
