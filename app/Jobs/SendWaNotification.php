<?php

namespace App\Jobs;

use App\Models\ServiceOrder;
use App\Services\WaGateway;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWaNotification implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var ServiceOrder
     */
    public $serviceOrder;

    /**
     * @var string
     */
    public $type;

    /**
     * Create a new job instance.
     */
    public function __construct(ServiceOrder $serviceOrder, string $type)
    {
        $this->serviceOrder = $serviceOrder;
        $this->type = $type;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            if ($this->type === 'offer') {
                WaGateway::sendOffer($this->serviceOrder);
            } elseif ($this->type === 'update') {
                WaGateway::sendStatusUpdate($this->serviceOrder);
            }
        } catch (\Exception $e) {
            Log::error("SendWaNotification Error untuk Nota {$this->serviceOrder->order_number}: ".$e->getMessage());
        }
    }
}
