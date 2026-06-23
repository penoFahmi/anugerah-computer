<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Ai\Agents\CustomerService;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function ask(Request $request)
    {
        // 1. Validasi Input Keketatan Tinggi (Mencegah Payload Raksasa)
        $request->validate([
            'message' => ['required', 'string', 'max:500'],
            'history' => ['nullable', 'array', 'max:10'],
        ]);

        $message = $request->input('message');
        $history = $request->input('history', []);

        try {
            // 2. Panggil Agent AI
            $agent = new CustomerService($history);
            $response = $agent->prompt($message);

            // 3. Kembalikan Jawaban Sukses
            return response()->json([
                'status' => 'success',
                'reply' => (string) $response
            ]);

        } catch (\Exception $e) {
            // ==========================================
            // SECURITY GUARDRAIL: Pencegahan Information Disclosure (CWE-200)
            // ==========================================
            
            // 1. Catat error ASLI secara rahasia di laravel.log untuk Developer
            Log::error('AI_CHATBOT_CRITICAL_ERROR', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'ip' => $request->ip()
            ]);

            // 2. Analisis tipe error untuk pesan yang lebih manusiawi (UX)
            $userFriendlyMessage = 'Maaf kak, saat ini jaringan AI kami sedang mengalami gangguan. Silakan coba beberapa saat lagi atau hubungi via WA ya. 🙏';

            // Jika error-nya karena cURL timeout atau TLS/SSL putus (koneksi Groq bermasalah)
            if (str_contains($e->getMessage(), 'cURL error') || str_contains($e->getMessage(), 'Connection timed out')) {
                $userFriendlyMessage = 'Waduh, koneksi ke otak AI sedang terputus nih kak. Mohon tunggu sebentar lalu coba kirim lagi ya. 🔌';
            }

            // 3. Kembalikan respons yang sudah disterilkan ke Frontend
            return response()->json([
                'status' => 'error',
                'reply' => $userFriendlyMessage
            ], 503);
        }
    }
}