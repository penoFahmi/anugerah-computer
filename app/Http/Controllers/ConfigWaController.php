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
            // Beri timeout 3 detik agar Laravel tidak hang menunggu Node.js restart
            Http::timeout(3)->post("{$this->gatewayUrl}/logout");
        } catch (\Exception $e) {}
        
        return back();
    }
}