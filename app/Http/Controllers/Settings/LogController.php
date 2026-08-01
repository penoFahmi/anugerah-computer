<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\ChatLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogController extends Controller
{
    /**
     * Display a listing of Chat and System Logs.
     */
    public function index(Request $request): Response
    {
        $query = ChatLog::with(['customer', 'serviceOrder'])->latest();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('message', 'like', "%{$search}%")
                ->orWhere('final_intent', 'like', "%{$search}%")
                ->orWhere('sender_name', 'like', "%{$search}%");
        }

        if ($request->has('intent') && $request->get('intent') !== 'all') {
            $query->where('final_intent', $request->get('intent'));
        }

        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('handling_status', $request->get('status'));
        }

        if ($request->has('direction') && $request->get('direction') !== 'all') {
            $query->where('direction', $request->get('direction'));
        }

        $perPage = $request->get('per_page', '15');
        if ($perPage === 'all') {
            $totalCount = $query->count();
            $logs = $query->paginate($totalCount > 0 ? $totalCount : 1)->withQueryString();
        } else {
            $logs = $query->paginate((int) $perPage)->withQueryString();
        }

        // Data Agregasi untuk Grafik (Berdasarkan filter pencarian saat ini)
        $aggregateQuery = ChatLog::query();
        if ($request->has('search')) {
            $search = $request->get('search');
            $aggregateQuery->where(function($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                  ->orWhere('final_intent', 'like', "%{$search}%")
                  ->orWhere('sender_name', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('direction') && $request->get('direction') !== 'all') {
            $aggregateQuery->where('direction', $request->get('direction'));
        }
        
        $intentStats = (clone $aggregateQuery)
            ->selectRaw('final_intent as name, count(*) as value')
            ->whereNotNull('final_intent')
            ->where('direction', 'inbound')
            ->groupBy('final_intent')
            ->get();

        $sourceStats = (clone $aggregateQuery)
            ->selectRaw('resolved_by as name, count(*) as value')
            ->whereNotNull('resolved_by')
            ->where('resolved_by', '!=', 'pending')
            ->where('direction', 'inbound')
            ->groupBy('resolved_by')
            ->get();
        // --- METRIK SKRIPSI ---
        
        // 1. Rata-rata Confidence Score NLP
        $avgConfidence = (clone $aggregateQuery)
            ->where('direction', 'inbound')
            ->whereNotNull('svm_confidence_score')
            ->avg('svm_confidence_score') ?? 0;
            
        // 2. Efisiensi Token (Estimasi Token LLM yang Dihemat oleh NLP)
        $nlpHandledCount = (clone $aggregateQuery)
            ->where('direction', 'inbound')
            ->where('resolved_by', 'nlp_model')
            ->count();
            
        // Cari rata-rata penggunaan token LLM
        $avgLlmTokens = (clone $aggregateQuery)
            ->where('direction', 'inbound')
            ->where('resolved_by', 'llm_model')
            ->whereNotNull('llm_prompt_tokens')
            ->selectRaw('AVG(llm_prompt_tokens + llm_completion_tokens) as avg_tokens')
            ->value('avg_tokens');
            
        // Jika belum ada data LLM, asumsikan rata-rata 800 token per request (standar Groq Llama3)
        $avgLlmTokens = $avgLlmTokens ? (float) $avgLlmTokens : 800.0;
        $savedTokens = $nlpHandledCount * $avgLlmTokens;

        // 3. Tingkat Otonomi Sistem (Berapa persen pesan yang diselesaikan tanpa campur tangan Manusia)
        $totalInbound = (clone $aggregateQuery)->where('direction', 'inbound')->count();
        $humanInbound = (clone $aggregateQuery)->where('direction', 'inbound')->whereIn('resolved_by', ['human', 'pending'])->count();
        $aiInbound = $totalInbound - $humanInbound;
        $autonomyRate = $totalInbound > 0 ? ($aiInbound / $totalInbound) * 100 : 0;

        return Inertia::render('logs/list', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'intent', 'status', 'direction', 'per_page']),
            'intentStats' => $intentStats,
            'sourceStats' => $sourceStats,
            'academicMetrics' => [
                'avgConfidence' => round($avgConfidence * 100, 1),
                'savedTokens' => round($savedTokens),
                'autonomyRate' => round($autonomyRate, 1),
                'totalInbound' => $totalInbound
            ]
        ]);
    }
}
