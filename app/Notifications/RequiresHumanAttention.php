<?php

namespace App\Notifications;

use App\Models\ChatLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class RequiresHumanAttention extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(public ChatLog $chatLog)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'chat_alert',
            'title' => 'Panggilan Darurat Chat',
            'message' => 'Sistem AI meminta bantuan Admin untuk membalas WA pelanggan.',
            'action_url' => null,
            'chat_log' => $this->chatLog->toArray()
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'data' => $this->toArray($notifiable),
            'chatLog' => $this->chatLog->toArray()
        ]);
    }
}
