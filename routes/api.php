<?php

use App\Http\Controllers\Api\WhatsappWebhookController;
use App\Http\Controllers\Api\ChatbotController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Here is where you can register API routes for your application.
| These routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
*/

// Entry point untuk Webhook WhatsApp (Baileys)
Route::post('/message', [WhatsappWebhookController::class, 'handle']);

// Endpoint untuk AI Chatbot (Landing Page)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/chatbot/ask', [ChatbotController::class, 'ask'])->name('api.chatbot.ask');
});