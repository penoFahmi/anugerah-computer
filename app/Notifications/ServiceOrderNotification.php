<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ServiceOrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected string $message,
        protected ?string $actionUrl = null,
        protected string $type = 'service_update'
    ) {}

    /**
     * Tentukan channel pengiriman (Database + WebSockets).
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Struktur data yang disimpan ke tabel `notifications`.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => $this->message,
            'action_url' => $this->actionUrl,
            'type' => $this->type,
        ];
    }

    /**
     * Struktur payload data real-time yang dilempar Reverb ke React.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'message' => $this->message,
            'action_url' => $this->actionUrl,
            'type' => $this->type,
            'created_at' => now()->toIso8601String(),
        ]);
    }
}