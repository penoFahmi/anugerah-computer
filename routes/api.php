<?php

use App\Http\Controllers\Api\WhatsappWebhookController;
use App\Http\Controllers\Api\ChatbotController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:120,1')->group(function () {
    Route::post('/message', [WhatsappWebhookController::class, 'handle']);
});
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/chatbot/ask', [ChatbotController::class, 'ask'])->name('api.chatbot.ask');
});