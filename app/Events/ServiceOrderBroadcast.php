<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\ServiceOrder;

/**
 * Event ini digunakan untuk mengirimkan notifikasi real-time ke admin ketika ada perubahan pada ServiceOrder.
 * Event ini akan dikirimkan melalui channel private 'admin.notifications' dan dapat didengarkan oleh admin menggunakan React Echo.
 */

class ServiceOrderBroadcast implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param string $action Jenis aksi: 'created', 'updated', 'deleted'
     */
    public function __construct(
        public ServiceOrder $serviceOrder,
        public string $action
    ) {}

    /**
     * Kirimkan ke channel admin yang sudah kita amankan di channels.php
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.notifications'),
        ];
    }

    /**
     * Berikan nama alias event agar mudah dipanggil di React Echo
     */
    public function broadcastAs(): string
    {
        return 'service.crud';
    }
}