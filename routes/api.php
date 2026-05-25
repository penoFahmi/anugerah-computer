<?php

use App\Http\Controllers\Api\WhatsappWebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:120,1')->group(function () {
    Route::post('/message', [WhatsappWebhookController::class, 'handle']);
});