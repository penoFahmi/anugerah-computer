<?php

namespace App\Http\Controllers\Api;

use App\Ai\Agents\InternalCopilot;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\ServiceOrder;
use App\Models\Transaction;
use App\Models\SparePart;
use App\Enums\TransactionType;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class AiCopilotController extends Controller
{

    /**
     * AI Copilot untuk Owner: Insight Bisnis Harian (Cached 6 jam).
     */
    public function businessInsight(Request $request): JsonResponse
    {
        $cacheKey = 'ai_business_insight_' . now()->format('Y-m-d');
        
        if (Cache::has($cacheKey)) {
            return response()->json(['insight' => Cache::get($cacheKey)]);
        }

        $today = Carbon::today();
        
        $incomeToday = Transaction::where('type', TransactionType::INCOME)->whereDate('transaction_date', $today)->sum('amount');
        $expenseToday = Transaction::where('type', TransactionType::EXPENSE)->whereDate('transaction_date', $today)->sum('amount');
        $activeServices = ServiceOrder::whereNotIn('status', ['completed', 'cancelled', 'taken'])->count();
        $lowStock = SparePart::where('stock', '<=', 5)->get(['name', 'stock']);
        
        $lowStockText = $lowStock->isEmpty() ? 'Aman' : $lowStock->map(fn($item) => "{$item->name} (sisa {$item->stock})")->implode(', ');

        $systemRole = "Anda adalah Konsultan Keuangan dan Bisnis Senior. Berikan ringkasan harian (maksimal 3 kalimat pendek yang powerful dan memotivasi) berdasarkan metrik bisnis hari ini. Dilarang menggunakan poin-poin (bullet points), tulis dalam format paragraf kasual tapi profesional.";
        $agent = new InternalCopilot($systemRole);
        
        $prompt = "Data Hari Ini:\n"
                . "Pendapatan: Rp " . number_format($incomeToday, 0, ',', '.') . "\n"
                . "Pengeluaran: Rp " . number_format($expenseToday, 0, ',', '.') . "\n"
                . "Servis Aktif: " . $activeServices . " unit\n"
                . "Stok Kritis: " . $lowStockText;

        try {
            $response = (string) $agent->prompt($prompt);
            // Cache for 6 hours (6 * 60 * 60 seconds)
            Cache::put($cacheKey, $response, 60 * 60 * 6);
            return response()->json(['insight' => $response]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal menghubungi AI'], 500);
        }
    }
}
