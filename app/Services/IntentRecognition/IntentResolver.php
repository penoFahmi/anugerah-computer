<?php

namespace App\Services\IntentRecognition;

use Illuminate\Support\Facades\Log;
use App\Ai\Agents\IntentAnalyzer;

class IntentResolver
{
    // Kamus kata kunci untuk Levenshtein Distance
    /**
     * Resolusi Niat (Intent) Pelanggan.
     * Mengembalikan Array: ['intent' => '...', 'method' => '...', 'score' => ...]
     */
    private array $approveKeywords = ['setuju', 'lanjut', 'oke', 'iya', 'kerjakan', 'ok', 'y', 'yoi'];
    private array $cancelKeywords = ['batal', 'jangan', 'cancel', 'tidak', 'gak', 'gk', 'stop', 'mahal'];

    public function resolve(string $message): array
    {
        $message = strtolower(trim($message));

        // 1. Coba dengan Levenshtein Distance
        $ldResult = $this->analyzeWithLevenshtein($message);
        
        if ($ldResult['intent'] !== 'unclear') {
            return $ldResult;
        }

        // 2. Fallback ke LLM menggunakan Agent
        return $this->analyzeWithLLM($message);
    }

    /**
     * METODE 1: LEVENSHTEIN DISTANCE
     */
    private function analyzeWithLevenshtein(string $message): array
    {
        $words = explode(' ', $message);
        $bestScore = -1;
        $bestMatch = '';
        $matchedIntent = 'unclear';
        $threshold = 2; // Ambang batas typo (misal: "okeee" jaraknya 2 dari "oke")

        foreach ($words as $word) {
            // Cek kata persetujuan
            foreach ($this->approveKeywords as $keyword) {
                $distance = levenshtein($word, $keyword);
                if ($distance <= $threshold && ($bestScore === -1 || $distance < $bestScore)) {
                    $bestScore = $distance;
                    $bestMatch = $keyword;
                    $matchedIntent = 'approve';
                }
            }

            // Cek kata pembatalan
            foreach ($this->cancelKeywords as $keyword) {
                $distance = levenshtein($word, $keyword);
                if ($distance <= $threshold && ($bestScore === -1 || $distance < $bestScore)) {
                    $bestScore = $distance;
                    $bestMatch = $keyword;
                    $matchedIntent = 'cancel';
                }
            }
        }

        // Jika ditemukan kecocokan yang kuat
        if ($matchedIntent !== 'unclear') {
            return [
                'intent' => $matchedIntent,
                'method' => 'levenshtein',
                'score'  => $bestScore,
                'match'  => $bestMatch,
            ];
        }

        return ['intent' => 'unclear', 'method' => 'levenshtein', 'score' => null];
    }

    /**
     * METODE 2: LARGE LANGUAGE MODEL (LLM) via Laravel AI SDK
     */
    private function analyzeWithLLM(string $message): array
    {
        try {
            // Panggil Agent yang sudah kita rancang
            $response = (new IntentAnalyzer)->prompt($message);

            // Karena Agent pakai HasStructuredOutput, kita bisa akses hasilnya seperti array
            $intent = $response['intent'];
            $reasoning = $response['reasoning'];

            return [
                'intent' => $intent,
                'method' => 'llm',
                'score'  => null, 
                'raw'    => $reasoning, // Kita simpan alasannya sebagai raw response
            ];

        } catch (\Exception $e) {
            Log::error('LLM Intent Recognition Failed: ' . $e->getMessage());
            return ['intent' => 'unclear', 'method' => 'llm_failed', 'score' => null];
        }
    }
}