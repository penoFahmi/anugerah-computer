<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\PegawaiController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified', 'is_active'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    
});

Route::middleware(['auth', 'verified', 'is_active'])->group(function () {
    Route::middleware('role:admin')->group(function () {
        Route::resource('pegawai', PegawaiController::class)->except(['create', 'edit']);
        Route::patch('pegawai/{pegawai}/toggle-status', [PegawaiController::class, 'toggleStatus'])
            ->name('pegawai.toggle-status');
    });
});

require __DIR__.'/settings.php';
