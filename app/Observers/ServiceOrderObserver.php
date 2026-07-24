<?php

namespace App\Observers;

use App\Models\ServiceOrder;
use App\Models\User;
use App\Notifications\ServiceOrderStatusChanged;
use Illuminate\Support\Facades\Notification;

class ServiceOrderObserver
{
    public function created(ServiceOrder $serviceOrder): void
    {
        $users = User::where('id', '!=', auth()->id())->get();
        $brand = $serviceOrder->device->brand ?? 'Perangkat';
        $customerName = $serviceOrder->customer->name ?? 'Pelanggan';
        
        Notification::send($users, new ServiceOrderStatusChanged(
            $serviceOrder,
            'service_new',
            'Servisan Baru Masuk',
            "{$brand} milik {$customerName} masuk antrean."
        ));
    }

    public function updated(ServiceOrder $serviceOrder): void
    {
        if ($serviceOrder->isDirty('status')) {
            $newStatus = $serviceOrder->status->value;
            $brand = $serviceOrder->device->brand ?? 'Perangkat';
            $customerName = $serviceOrder->customer->name ?? 'Pelanggan';
            $users = User::where('id', '!=', auth()->id())->get();

            if ($newStatus === 'waiting_approval') {
                $cost = 'Rp ' . number_format((float) $serviceOrder->estimated_cost, 0, ',', '.');
                Notification::send($users, new ServiceOrderStatusChanged(
                    $serviceOrder,
                    'service_waiting',
                    'Persetujuan Biaya',
                    "Teknisi mengestimasi biaya {$cost} untuk {$brand} milik {$customerName}. Mohon hubungi pelanggan."
                ));
            } elseif ($newStatus === 'approved') {
                Notification::send($users, new ServiceOrderStatusChanged(
                    $serviceOrder,
                    'service_approved',
                    'Biaya Disetujui',
                    "Pelanggan {$customerName} menyetujui biaya servis untuk {$brand}. Teknisi bisa mulai pengerjaan."
                ));
            } elseif ($newStatus === 'cancelled') {
                Notification::send($users, new ServiceOrderStatusChanged(
                    $serviceOrder,
                    'service_cancelled',
                    'Servis Dibatalkan',
                    "Pelanggan {$customerName} membatalkan servis {$brand}."
                ));
            } elseif ($newStatus === 'completed') {
                Notification::send($users, new ServiceOrderStatusChanged(
                    $serviceOrder,
                    'service_completed',
                    'Servis Selesai',
                    "Perbaikan {$brand} milik {$customerName} sudah selesai. Segera kabari pelanggan."
                ));
            }
        }
    }
}
