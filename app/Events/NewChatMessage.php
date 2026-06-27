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

    public function __construct(public ChatLog $chatLog) {}

    // Event ini akan didengarkan di ruang chat per-nota
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.service.' . $this->chatLog->service_order_id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['chat' => $this->chatLog->toArray()];
    }
}