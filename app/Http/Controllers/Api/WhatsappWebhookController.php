<?php

namespace App\Http\Controllers\Api;

use App\Services\WaGateway;
use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\ChatLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Ai\Agents\IntentAnalyzer;
use App\Ai\Agents\CustomerService;
use Illuminate\Support\Facades\Http;

class WhatsappWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse 
    {
        // 1. Validasi Keamanan Token
        $expectedToken = config('services.wa_gateway.token');
        $receivedToken = $request->header('X-Token');

        if (!$receivedToken || $receivedToken !== $expectedToken) {
            return response()->json(['error' => 'Unauthorized Access'], 401);
        }

        // 2. Validasi Input Dasar
        $request->validate([
            'phone' => ['required', 'string'],
            'message' => ['required', 'string', 'max:20000'],
        ]);

        $rawPhone = $request->phone;
        $originalMessage = trim($request->message);
        
        // 3. Normalisasi Nomor HP (Ubah 62 jadi 0)
        $searchPhone = $rawPhone; 
        if (str_starts_with($rawPhone, '62')) {
            $searchPhone = '0' . substr($rawPhone, 2); 
        }

        // 4. Cari Tiket Servis Aktif (Hanya yang statusnya waiting_approval)
        $serviceOrder = ServiceOrder::whereHas('customer', function ($query) use ($rawPhone, $searchPhone) {
            $query->where('phone', $rawPhone)->orWhere('phone', $searchPhone);
        })
        ->where('status', 'waiting_approval')
        ->latest()
        ->first();

        // 5. Simpan Pesan ke Chat Logs SEBELUM divalidasi AI
        // Berkat nullable() di migrasi, sekarang ini tidak akan error lagi!
        $chatLog = ChatLog::create([
            'service_order_id' => $serviceOrder ? $serviceOrder->id : null, 
            'direction' => 'inbound',
            'message' => $originalMessage,
            'resolved_by' => $serviceOrder ? null : 'human', // Kalau tak ada tiket, biar dibaca manusia
            'final_intent' => $serviceOrder ? null : 'unclear',
        ]);

        // 6. Jika tidak ada tiket servis (Pesan Umum / CS)
        if (!$serviceOrder) {
            try {
                // a. Minta LLM memikirkan jawaban yang ramah
                $aiResponse = (string) (new CustomerService)->prompt($originalMessage);

                // b. CATAT KE DATABASE DULU (Harga mati, pantang mundur!)
                $chatLog->update([
                    'resolved_by' => 'llm',
                    'llm_raw_response' => $aiResponse,
                    'final_intent' => 'unclear'
                ]);

                // c. Perintahkan Node.js mengirim balasan, TAPI JANGAN DITUNGGU!
                try {
                    // Timeout diset sangat kecil (2 detik) agar Laravel langsung lanjut kerja
                    Http::timeout(2)->post('http://127.0.0.1:3001/send-message', [
                        'phone' => $rawPhone,
                        'message' => $aiResponse
                    ]);
                } catch (\Exception $e) {
                    // Abaikan error
                    Log::info('Pesan sedang diproses Node.js (Sinkronisasi Enkripsi WA)...');
                }

                // Berikan respon sukses ke sistem agar tidak dianggap gagal
                return response()->json([
                    'status' => 'replied_by_cs',
                    'chat_log_id' => $chatLog->id
                ], 200);

            } catch (\Throwable $e) {
                Log::error('CS AI Error: ' . $e->getMessage());
                return response()->json(['error' => 'Gagal membalas via AI'], 200); // Tetap 200 agar Node.js tidak error
            }
        }

        // nanti ke nlp kita yang berjalan di python di port setting nanti

        // 7. Jika ada tiket servis, lanjutkan ke Intent Recognition chatbot
        try {
            $intent = (new IntentAnalyzer)->prompt($originalMessage);
            $chatLog->update([
                'final_intent' => $intent,
            ]);
            $serviceOrder->update([
                'last_customer_message' => $originalMessage,
            ]);
            

        }

        catch (\Throwable $e) {
            Log::error('Webhook AI Error: ' . $e->getMessage());
            
            $chatLog->update([
                'final_intent' => 'unclear',
                'resolved_by' => 'human', 
            ]);

            return response()->json(['error' => 'Internal Server Error'], 500);
        }

        return response()->json(['status' => 'processed'], 200);
    }
}