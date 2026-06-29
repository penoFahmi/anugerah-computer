<?php

namespace App\Notifications;

use App\Models\ServiceOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewServiceOrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public ServiceOrder $serviceOrder,
        public string $creatorName
    ) {}

    // Notifikasi dikirim via Database (disimpan) & Broadcast (Reverb Real-time)
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    // Data yang disimpan di tabel `notifications`
    public function toArray(object $notifiable): array
    {
        return [
            'service_order_id' => $this->serviceOrder->id,
            'order_number' => $this->serviceOrder->order_number,
            'message' => "{$this->creatorName} menambahkan servisan baru ({$this->serviceOrder->device->brand}).",
            'type' => 'new_service'
        ];
    }

    // Data yang dilempar ke Socket Reverb
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'data' => $this->toArray($notifiable),
            'created_at' => now()->toIso8601String(),
            'read_at' => null,
        ]);
    }
}