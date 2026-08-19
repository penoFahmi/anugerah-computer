<?php

namespace App\Imports;

use App\Enums\ServiceStatus;
use App\Models\Customer;
use App\Models\Device;
use App\Models\ServiceOrder;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Str;

class ServiceOrderImport implements ToModel, WithHeadingRow
{
    public function model(array $row): \Illuminate\Database\Eloquent\Model|array|null
    {
        // Pastikan baris tidak kosong
        if (empty($row['customer_name']) && empty($row['customer_phone'])) {
            return null;
        }

        // 1. Buat atau cari Pelanggan berdasarkan nomor HP
        $phone = $row['customer_phone'] ?? '00000000000';
        $customer = Customer::firstOrCreate(
            ['phone' => $phone],
            ['name' => $row['customer_name'] ?? 'Tanpa Nama']
        );

        // 2. Buat atau cari Perangkat milik Pelanggan ini
        $brand = $row['device_brand'] ?? 'Unknown';
        $model = $row['device_model'] ?? 'Unknown';
        $device = Device::firstOrCreate([
            'customer_id' => $customer->id,
            'brand' => $brand,
            'model' => $model,
        ], [
            'device_type' => 'Laptop', // Default type
        ]);

        // 3. Nomor Order (Gunakan dari Excel jika ada, jika kosong generate baru)
        if (!empty($row['order_number'])) {
            $orderNumber = $row['order_number'];
        } else {
            $datePrefix = 'SRV-' . now()->format('Ymd') . '-';
            $lastOrder = ServiceOrder::where('order_number', 'like', $datePrefix . '%')
                ->orderBy('order_number', 'desc')
                ->first();
            $nextSequence = $lastOrder ? ((int) substr($lastOrder->order_number, -3)) + 1 : 1;
            $orderNumber = $datePrefix . str_pad((string) $nextSequence, 3, '0', STR_PAD_LEFT);
        }
        
        // Coba parsing tanggal buat atau gunakan now()
        $createdAt = now();
        if (!empty($row['created_at'])) {
            try {
                $createdAt = Carbon::parse($row['created_at']);
            } catch (\Exception $e) {
                $createdAt = now();
            }
        }

        // Parse status. Jika tidak valid, fallback ke COMPLETED (karena biasanya data lama sudah selesai)
        $statusValue = strtolower($row['status'] ?? '');
        $status = ServiceStatus::tryFrom($statusValue) ?? ServiceStatus::COMPLETED;

        // 4. Buat Service Order
        return new ServiceOrder([
            'order_number' => $orderNumber,
            'customer_id' => $customer->id,
            'device_id' => $device->id,
            'complaint' => $row['complaint'] ?? 'Migrasi Data Lama',
            'status' => $status,
            'is_technician_on_site' => true,
            'is_unit_left_at_store' => false,
            'estimated_cost' => $row['estimated_cost'] ?? 0,
            'down_payment' => $row['down_payment'] ?? 0,
            'final_cost' => $row['final_cost'] ?? 0,
            'technician_notes' => $row['technician_notes'] ?? null,
            'created_by' => auth()->id() ?? 1,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }
}
