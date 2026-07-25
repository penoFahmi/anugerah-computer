<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class ConfigWaController extends Controller
{
    /**
     * Tampilkan halaman status dan konfigurasi WhatsApp Gateway.
     */
    public function index(): Response
    {
        $waStatus = [
            'isConnected' => false,
            'phoneNumber' => null,
            'qrCode' => null,
        ];

        try {
            $gatewayUrl = config('services.wa_gateway.url');
            $response = Http::timeout(2)->get("{$gatewayUrl}/status");
            if ($response->successful()) {
                $data = $response->json();
                $waStatus = [
                    'isConnected' => $data['isConnected'],
                    'phoneNumber' => $data['number'],
                    'qrCode' => $data['qr'],
                ];
            }
        } catch (\Exception $e) {
            // Server Node.js mati
        }

        return Inertia::render('config/config-wa', [
            'waStatus' => $waStatus,
        ]);
    }

    /**
     * Logout dari sesi WhatsApp Gateway.
     */
    public function logout(): RedirectResponse
    {
        try {
            // Ambil token dari config/services.php
            // Catatan: Ubah 'services.wa_gateway.token' sesuai dengan key yang kamu buat di services.php
            $token = config('services.wa_gateway.token');
            $gatewayUrl = config('services.wa_gateway.url');

            Http::withHeaders([
                'X-Token' => $token,
            ])->timeout(3)->post("{$gatewayUrl}/logout");
        } catch (\Exception $e) {
            // Error handling opsional
        }

        return back();
    }
}
