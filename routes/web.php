<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\PegawaiController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('pegawai', PegawaiController::class)->names([
        'index'   => 'pegawai.index',
        'store'   => 'pegawai.store',
        'update'  => 'pegawai.update',
        'destroy' => 'pegawai.destroy',
    ]);
});

require __DIR__.'/settings.php';
