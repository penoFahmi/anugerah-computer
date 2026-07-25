<?php

namespace App\Services\Ai;

use App\Ai\Agents\IntentAnalyzer;
use App\Models\ChatLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotPipeline
{
    /**
     * @return array{intent: string, tokens: array{prompt: int, completion: int}, source: string}
     */
    public function process(ChatLog $chatLog): array
    {
        $originalMessage = $chatLog->message;
        $nlpIntent = 'lainnya';
        $nlpConfidence = 0.0;
        $isSvmSuccessful = 0;
        
        $tokens = ['prompt' => 0, 'completion' => 0];

        // 1. Panggil NLP Python Lokal (FastText SVM)
        try {
            $nlpEndpoint = config('services.nlp.endpoint');
            $response = Http::timeout(5)->post($nlpEndpoint, [
                'text' => $originalMessage,
            ]);

            if ($response->successful()) {
                $nlpData = $response->json();
                $nlpIntent = $nlpData['intent'] ?? 'lainnya';
                $nlpConfidence = $nlpData['confidence'] ?? 0.0;
                $isSvmSuccessful = 1;
            }
        } catch (\Exception $e) {
            Log::error('Koneksi ke NLP Python gagal: '.$e->getMessage());
        }

        $chatLog->update([
            'svm_predicted_intent' => $nlpIntent,
            'svm_confidence_score' => $nlpConfidence,
            'is_svm_successful' => $isSvmSuccessful,
        ]);

        // 2. Evaluasi Threshold
        if ($nlpConfidence >= 0.75) {
            return [
                'intent' => $nlpIntent,
                'tokens' => $tokens,
                'source' => 'agent_nlp_fasttext'
            ];
        }

        // 3. Fallback ke LLM (Groq)
        $chatLog->update(['is_llm_triggered' => 1]);
        try {
            $intentAgent = new IntentAnalyzer;
            // Instruksikan LLM Analyzer HANYA untuk mendeteksi intent KRITIS (Setuju/Batal).
            // Jika pertanyaan umum, kembalikan 'lainnya' agar ditangani oleh LLM Generatif (CustomerService).
            // Sinkronisasi dengan 3 Intent dari Python NLP
            $analysis = $intentAgent->prompt(
                "Pesan: {$originalMessage}\n".
                "Klasifikasikan pesan di atas ke dalam SALAH SATU niat (intent) berikut: ".
                "'setuju', 'batal', 'lainnya'.\n".
                "ATURAN KHUSUS:\n".
                "- Jika pelanggan mengkonfirmasi untuk lanjut servis, pilih 'setuju'.\n".
                "- Jika pelanggan membatalkan servis, pilih 'batal'.\n".
                "- Selain dari itu (tanya harga, marah, sapaan, dll), pilih 'lainnya'."
            );
            
            $analysisData = [];
            if (is_string($analysis)) {
                $jsonStart = strpos($analysis, '{');
                $jsonEnd = strrpos($analysis, '}');
                if ($jsonStart !== false && $jsonEnd !== false && $jsonEnd > $jsonStart) {
                    $cleanJson = substr($analysis, $jsonStart, $jsonEnd - $jsonStart + 1);
                    $analysisData = json_decode($cleanJson, true) ?? [];
                }
            } else {
                $analysisData = json_decode(json_encode($analysis), true);
            }
            if (!is_array($analysisData)) {
                $analysisData = [];
            }

            $llmIntent = $analysisData['intent'] ?? 'lainnya';
            $reasoning = $analysisData['reasoning'] ?? 'Dianalisis oleh Fallback LLM';

            // Estimasi Token
            $tokens['prompt'] = (int) ceil(str_word_count((string) $intentAgent->instructions().' '.$originalMessage) * 1.5);
            $tokens['completion'] = (int) ceil(str_word_count(json_encode($analysisData)) * 1.5);

            $chatLog->update([
                'llm_raw_response' => ['reasoning' => $reasoning],
            ]);

            return [
                'intent' => $llmIntent,
                'tokens' => $tokens,
                'source' => 'agent_intent_analyzer_fallback'
            ];

        } catch (\Throwable $e) {
            Log::error('Fallback LLM Error: '.$e->getMessage());
            return [
                'intent' => 'needs_manual_override',
                'tokens' => $tokens,
                'source' => 'error'
            ];
        }
    }
}
