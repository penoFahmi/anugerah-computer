<?php

namespace App\Notifications;

use App\Models\ChatLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewWhatsappMessage extends Notification implements ShouldBroadcast
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
        $messageSnippet = mb_substr($this->chatLog->message, 0, 30) . '...';
        return [
            'type' => 'chat_message',
            'message' => "Pesan WA: \"{$messageSnippet}\"",
            'action_url' => null, // UI akan merespon berdasarkan tipe notif
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
