<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Nota Tanda Terima - {{ $order->order_number }}</title>
    <style>
        @page { 
            margin: 15px; 
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #000;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .ticket { 
            width: 100%; 
            max-width: 320px; 
            margin: 0 auto; 
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        
        .border-top { border-top: 1px dashed #000; }
        .border-bottom { border-bottom: 1px dashed #000; }
        .p-y { padding: 8px 0; }
        .m-y { margin: 8px 0; }
        
        .header h2 { font-size: 16px; font-weight: bold; margin: 0 0 4px 0; letter-spacing: 1px; }
        .header p { margin: 2px 0; font-size: 10px; }
        
        table { width: 100%; border-collapse: collapse; }
        td { vertical-align: top; padding: 3px 0; font-size: 11px; }
        
        .w-30 { width: 30%; }
        .w-5 { width: 5%; }
        .w-65 { width: 65%; }
        
        .cost-table td { padding: 4px 0; }
        .total-row td { 
            font-weight: bold; 
            font-size: 12px; 
            border-top: 1px solid #000; 
            padding-top: 6px; 
            margin-top: 2px;
        }
        
        .notes-box { 
            border: 1px solid #000; 
            padding: 6px; 
            margin-top: 8px; 
            font-size: 10px; 
            border-radius: 4px;
            background-color: #f9f9f9;
        }

        /* Tatanan untuk Blok Tanda Tangan */
        .signature-block {
            margin-top: 15px;
            text-align: center;
        }
        .signature-block td {
            width: 50%;
            padding-bottom: 5px;
        }
        
        .footer { font-size: 9px; text-align: center; margin-top: 15px; }
    </style>
</head>
<body>

@php
    $isFinal = $order->final_cost > 0;
    $cost = $isFinal ? $order->final_cost : $order->estimated_cost;
    $dp = $order->down_payment ?? 0;
    $remaining = $cost - $dp;
    if ($remaining < 0) $remaining = 0;
    
    // Tentukan siapa kasirnya (Jika sudah diambil, tampilkan nama kasir yang menyerahkan)
    $isTaken = $order->status->value === 'taken';
    $picName = $isTaken ? ($order->handedOverBy->name ?? 'Kasir') : ($order->createdBy->name ?? 'Kasir');
    $picRole = $isTaken ? 'Diserahkan Oleh,' : 'Penerima / Kasir,';
@endphp

<div class="ticket">
    <!-- HEADER TOKO -->
    <div class="header text-center border-bottom p-y">
        <h2>ANUGERAH COMPUTER</h2>
        <p>Jl. Sepakat 2 Samping Blok E, Ayani 2</p>
        <p>WhatsApp: 0812-3456-7890</p>
    </div>

    <!-- INFORMASI NOTA -->
    <div class="border-bottom p-y">
        <table>
            <tr>
                <td class="w-30 bold">NO. NOTA</td>
                <td class="w-5">:</td>
                <td class="w-65 bold">{{ $order->order_number }}</td>
            </tr>
            <tr>
                <td>Tanggal</td>
                <td>:</td>
                <td>{{ $order->created_at->format('d M Y, H:i') }}</td>
            </tr>
        </table>
    </div>

    <!-- INFORMASI PELANGGAN & UNIT -->
    <div class="border-bottom p-y">
        <table>
            <tr>
                <td class="w-30">Pelanggan</td>
                <td class="w-5">:</td>
                <td class="w-65 bold">{{ $order->customer->name }}</td>
            </tr>
            <tr>
                <td>No. WA</td>
                <td>:</td>
                <td>{{ $order->customer->phone }}</td>
            </tr>
            <tr>
                <td>Unit</td>
                <td>:</td>
                <td class="bold">{{ $order->device->brand }} {{ $order->device->model }} ({{ $order->device->device_type }})</td>
            </tr>
            <tr>
                <td>Keluhan</td>
                <td>:</td>
                <td>{{ $order->complaint }}</td>
            </tr>
            @if(!empty($order->equipments) && is_array($order->equipments) && count($order->equipments) > 0)
            <tr>
                <td>Kelengkapan</td>
                <td>:</td>
                <td>{{ implode(', ', $order->equipments) }}</td>
            </tr>
            @endif
        </table>
    </div>

    <!-- STATUS SAAT INI -->
    <div class="text-center border-bottom p-y">
        <span>Status Unit Saat Ini:</span><br>
        <span class="bold uppercase" style="font-size: 13px;">*** {{ $order->status->label() }} ***</span>
    </div>

    <!-- RINCIAN BIAYA (KALKULATOR) -->
    <div class="border-bottom p-y">
        <table class="cost-table">
            <tr>
                <td width="60%">{{ $isFinal ? 'Biaya Akhir (Final)' : 'Estimasi Biaya' }}</td>
                <td width="5%">:</td>
                <td width="35%" class="text-right">Rp {{ number_format($cost, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Telah Dibayar (DP)</td>
                <td>:</td>
                <td class="text-right">Rp {{ number_format($dp, 0, ',', '.') }}</td>
            </tr>
            <tr class="total-row">
                <td>SISA TAGIHAN</td>
                <td>:</td>
                <td class="text-right">Rp {{ number_format($remaining, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    <!-- CATATAN TEKNISI -->
    @if($order->technician_notes)
    <div class="notes-box">
        <div class="bold" style="margin-bottom: 3px;">Catatan Teknisi:</div>
        {{ $order->technician_notes }}
    </div>
    @endif

    <!-- INFORMASI GARANSI -->
    @if($isTaken && $order->warranty)
    <div class="notes-box" style="border: 1px dashed #000; text-align: center;">
        <div class="bold uppercase">*** BUKTI GARANSI ***</div>
        <div style="margin: 3px 0;">Kode: <span class="bold">{{ $order->warranty->warranty_code }}</span></div>
        <div>Berlaku s/d: <span class="bold">{{ $order->warranty->end_date->format('d M Y') }}</span></div>
    </div>
    @endif

    <!-- BLOK TANDA TANGAN (SERAH TERIMA) -->
    <table class="signature-block">
        <tr>
            <td>
                Pelanggan,
                <br><br><br><br>
                ( {{ $order->customer->name }} )
            </td>
            <td>
                {{ $picRole }}
                <br><br><br><br>
                ( {{ $picName }} )
            </td>
        </tr>
    </table>

    <!-- FOOTER SYARAT & KETENTUAN -->
    <div class="footer">
        <div class="border-bottom" style="margin-bottom: 8px;"></div>
        <p class="bold" style="font-size: 11px;">TERIMA KASIH</p>
        <p>1. Harap bawa nota digital/fisik ini saat pengambilan barang.</p>
        <p>2. Barang yang tidak diambil dalam waktu 3 bulan sejak selesai, di luar tanggung jawab kami.</p>
        <p>3. Garansi berlaku sesuai ketentuan dengan menyertakan nota & kode garansi.</p>
        <p style="margin-top: 10px;">-- Digenerate oleh Sistem --</p>
    </div>
</div>

</body>
</html>