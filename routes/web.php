<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\ConfigWaController;

Route::inertia('/', 'welcome', [
    // 'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified', 'is_active'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('services', ServiceOrderController::class)->except(['create', 'edit']);
});

// Routes untuk administrator
Route::middleware(['auth', 'verified', 'is_active'])->group(function () {
    Route::middleware('role:administrator')->group(function () {
        Route::resource('pegawai', PegawaiController::class)->except(['create', 'edit']);
        Route::patch('pegawai/{pegawai}/toggle-status', [PegawaiController::class, 'toggleStatus'])
            ->name('pegawai.toggle-status');
        Route::patch('/pegawai/{pegawai}/reset-password', [PegawaiController::class, 'resetPassword'])->name('pegawai.reset-password');

        Route::get('config/wa', [ConfigWaController::class, 'index'])->name('config.wa');
        Route::post('config/wa/logout', [ConfigWaController::class, 'logout'])->name('config.wa.logout');
    });
});

require __DIR__ . '/settings.php';
