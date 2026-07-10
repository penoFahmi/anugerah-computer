<?php

namespace App\Events;

use App\Models\ChatLog;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewChatMessage implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ChatLog $chatLog
    ) {}

    /**
     * Kirimkan ke channel admin yang sama dengan ServiceOrder
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.notifications'),
        ];
    }

    /**
     * Alias event untuk ditangkap di React Echo
     */
    public function broadcastAs(): string
    {
        return 'chat.new_message';
    }
}