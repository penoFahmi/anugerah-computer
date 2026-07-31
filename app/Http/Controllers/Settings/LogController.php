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

        $logs = $query->paginate(15)->withQueryString();

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
            ->groupBy('resolved_by')
            ->get();

        return Inertia::render('settings/logs/list', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'intent', 'status']),
            'intentStats' => $intentStats,
            'sourceStats' => $sourceStats,
        ]);
    }
}
