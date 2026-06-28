<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\ConfigWaController;
use App\Http\Controllers\TrashController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ChatController;

Route::inertia('/', 'welcome', [
    // 'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Routes untuk user yang sudah login, verified, dan aktif
Route::middleware(['auth', 'verified', 'is_active'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('/services/{serviceOrder}/chat', [ChatController::class, 'getHistory'])->name('chat.history');
    Route::post('/services/{serviceOrder}/chat', [ChatController::class, 'sendManual'])->name('chat.send');
    Route::post('/services/{serviceOrder}/trigger-wa', [ServiceOrderController::class, 'triggerWhatsappOffer'])->name('services.trigger-wa');
    Route::get('/services/{serviceOrder}/print-ticket', [ServiceOrderController::class, 'printTicketPDF'])->name('services.print-ticket');
    Route::get('/api/search-customer', [ServiceOrderController::class, 'searchCustomer'])->name('api.search-customer');
    Route::resource('services', ServiceOrderController::class)->parameters([
        'services' => 'serviceOrder'
    ])->only([
        'index',
        'store',
        'show',
        'update',
        'destroy'
    ]);

    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
});

// Routes untuk administrator
Route::middleware(['auth', 'verified', 'is_active'])->group(function () {
    Route::middleware('role:administrator')->group(function () {
        Route::resource('pegawai', PegawaiController::class)->except(['create', 'edit']);
        Route::patch('pegawai/{pegawai}/toggle-status', [PegawaiController::class, 'toggleStatus'])
            ->name('pegawai.toggle-status');
        Route::patch('/pegawai/{pegawai}/reset-password', [PegawaiController::class, 'resetPassword'])->name('pegawai.reset-password');

        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

        Route::get('/sampah', [TrashController::class, 'index'])->name('trash.index');
        Route::post('/sampah/{type}/{id}/restore', [TrashController::class, 'restore'])->name('trash.restore');
        Route::delete('/sampah/{type}/{id}/force-delete', [TrashController::class, 'forceDelete'])->name('trash.force-delete');

        Route::get('config/wa', [ConfigWaController::class, 'index'])->name('config.wa');
        Route::post('config/wa/logout', [ConfigWaController::class, 'logout'])->name('config.wa.logout');
    });
});

require __DIR__ . '/settings.php';
