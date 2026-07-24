<?php

namespace App\Notifications;

use App\Models\ServiceOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ServiceOrderStatusChanged extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable;

    public function __construct(
        public ServiceOrder $serviceOrder,
        public string $type,
        public string $title,
        public string $message
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'action_url' => '/services/' . $this->serviceOrder->id,
            'service_order_id' => $this->serviceOrder->id,
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'data' => $this->toDatabase($notifiable),
            'created_at' => now()->toISOString(),
        ]);
    }
}
