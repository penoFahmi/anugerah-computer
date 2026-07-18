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

        $logs = $query->paginate(15)->withQueryString();

        return Inertia::render('settings/logs/list', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'intent']),
        ]);
    }
}
