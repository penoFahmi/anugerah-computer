<?php

namespace App\Events;

use App\Models\ChatLog;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatRequiresHuman implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public ChatLog $chatLog) {}

    // Event ini akan didengarkan secara global oleh Admin di Dashboard
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.notifications'),
        ];
    }
}