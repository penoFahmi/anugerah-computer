<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Nota Tanda Terima - {{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 10px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .header {
            margin-bottom: 15px;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
        }
        .header h2 { margin: 0; font-size: 16px; }
        .header p { margin: 3px 0; font-size: 11px; }
        .info-table, .item-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .info-table td { padding: 2px 0; vertical-align: top; }
        .item-table th {
            border-bottom: 1px dashed #000;
            border-top: 1px dashed #000;
            padding: 5px 0;
            text-align: left;
        }
        .item-table td { padding: 5px 0; vertical-align: top; }
        .footer {
            margin-top: 20px;
            border-top: 1px dashed #000;
            padding-top: 5px;
            font-size: 10px;
        }
    </style>
</head>
<body>

    <div class="header text-center">
        <h2>ANUGERAH COMPUTER</h2>
        <p>Jl. Raya Pembangunan No. 45, Palembang</p>
        <p>WhatsApp: 0812-3456-7890</p>
    </div>

    <table class="info-table">
        <tr>
            <td class="bold" width="30%">No. Nota</td>
            <td width="5%">:</td>
            <td class="bold" width="65%">{{ $order->order_number }}</td>
        </tr>
        <tr>
            <td>Tanggal</td>
            <td>:</td>
            <td>{{ $order->created_at->format('d M Y, H:i') }} WIB</td>
        </tr>
        <tr>
            <td>Pelanggan</td>
            <td>:</td>
            <td>{{ $order->customer->name }} ({{ $order->customer->phone }})</td>
        </tr>
    </table>

    <table class="item-table">
        <thead>
            <tr>
                <th>Detail Unit Perbaikan & Keluhan</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <span class="bold">{{ $order->device->brand }} {{ $order->device->model }}</span> ({{ $order->device->device_type }})
                    <br>
                    <span style="font-style: italic;">Keluhan: "{{ $order->complaint }}"</span>
                    @if($order->equipments)
                        <br>
                        <span style="font-size: 11px; color: #555;">Kelengkapan: {{ implode(', ', $order->equipments) }}</span>
                    @endif
                </td>
            </tr>
        </tbody>
    </table>

    <table class="info-table" style="margin-top: 10px;">
        @if($order->down_payment > 0)
            <tr>
                <td width="65%" class="text-right">Uang Muka (DP):</td>
                <td width="35%" class="text-right bold">Rp {{ number_format($order->down_payment, 0, ',', '.') }}</td>
            </tr>
        @endif
        <tr>
            <td width="65%" class="text-right">Estimasi Biaya:</td>
            <td width="35%" class="text-right bold">
                {{ $order->estimated_cost > 0 ? 'Rp ' . number_format($order->estimated_cost, 0, ',', '.') : 'Menunggu Pengecekan' }}
            </td>
        </tr>
    </table>

    <div class="footer text-center">
        <p class="bold">TERIMA KASIH ATAS KEPERCAYAAN ANDA</p>
        <p>Nota digital ini sah dan dikirim otomatis via WhatsApp Gateway.</p>
        <p>Silakan simpan file PDF ini sebagai bukti pengambilan unit.</p>
    </div>

</body>
</html>