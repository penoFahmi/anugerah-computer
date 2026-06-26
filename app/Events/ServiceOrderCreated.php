<?php

namespace App\Events;

use App\Models\ServiceOrder;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ServiceOrderCreated
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\ServiceOrder $serviceOrder
     */
    public function __construct(
        public ServiceOrder $serviceOrder,
    ) {
    }
}
