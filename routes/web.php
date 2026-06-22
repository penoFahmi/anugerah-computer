<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\ConfigWaController;
use App\Http\Controllers\TrashController;
use App\Http\Controllers\CustomerController;

Route::inertia('/', 'welcome', [
    // 'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Routes untuk user yang sudah login, verified, dan aktif
Route::middleware(['auth', 'verified', 'is_active'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('/services', [ServiceOrderController::class, 'index'])->name('services.index');
    Route::post('/services', [ServiceOrderController::class, 'store'])->name('services.store');
    Route::get('/api/search-customer', [ServiceOrderController::class, 'searchCustomer'])->name('api.search-customer');

    Route::patch('/services/{serviceOrder}', [ServiceOrderController::class, 'update'])->name('services.update');
    Route::post('/services/{serviceOrder}/trigger-wa', [ServiceOrderController::class, 'triggerWhatsappOffer'])->name('services.trigger-wa');

    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

});

// Routes untuk administrator
Route::middleware(['auth', 'verified', 'is_active'])->group(function () {
    Route::middleware('role:administrator')->group(function () {
        Route::resource('pegawai', PegawaiController::class)->except(['create', 'edit']);
        Route::patch('pegawai/{pegawai}/toggle-status', [PegawaiController::class, 'toggleStatus'])
            ->name('pegawai.toggle-status');
        Route::patch('/pegawai/{pegawai}/reset-password', [PegawaiController::class, 'resetPassword'])->name('pegawai.reset-password');

        Route::get('/sampah', [TrashController::class, 'index'])->name('trash.index');
        Route::post('/sampah/{type}/{id}/restore', [TrashController::class, 'restore'])->name('trash.restore');
        Route::delete('/sampah/{type}/{id}/force-delete', [TrashController::class, 'forceDelete'])->name('trash.force-delete');

        Route::get('config/wa', [ConfigWaController::class, 'index'])->name('config.wa');
        Route::post('config/wa/logout', [ConfigWaController::class, 'logout'])->name('config.wa.logout');
    });
});

require __DIR__ . '/settings.php';
