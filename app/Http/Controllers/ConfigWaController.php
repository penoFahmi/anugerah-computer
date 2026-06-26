<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ConfigWaController extends Controller
{
    private $gatewayUrl = 'http://127.0.0.1:3001';

    public function index()
    {
        $waStatus = [
            'isConnected' => false,
            'phoneNumber' => null,
            'qrCode' => null,
        ];

        try {
            $response = Http::timeout(2)->get("{$this->gatewayUrl}/status");
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
            'waStatus' => $waStatus
        ]);
    }

    public function logout()
    {
        try {
            // Ambil token dari config/services.php
            // Catatan: Ubah 'services.wa_gateway.token' sesuai dengan key yang kamu buat di services.php
            $token = config('services.wa_gateway.token');

            Http::withHeaders([
                'X-Token' => $token
            ])->timeout(3)->post("{$this->gatewayUrl}/logout");
        } catch (\Exception $e) {
            // Error handling opsional
        }

        return back();
    }
}
