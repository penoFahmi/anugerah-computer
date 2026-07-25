<?php

namespace App\Events;

use App\Models\ChatLog;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatRequiresHuman implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ChatLog $chatLog
    ) {}

    /**
     * Kirimkan ke channel admin
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.notifications'),
        ];
    }

    /**
     * Alias event khusus untuk intervensi manusia
     */
    public function broadcastAs(): string
    {
        return 'chat.requires_human';
    }
}