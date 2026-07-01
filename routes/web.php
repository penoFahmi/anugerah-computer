<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\ConfigWaController;
use App\Http\Controllers\TrashController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\WarrantyController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::inertia('/', 'welcome')->name('home');

/*
|--------------------------------------------------------------------------
| Authenticated User Routes (Pegawai, Teknisi, Administrator)
|--------------------------------------------------------------------------
| Berlaku untuk semua user yang sudah login, email terverifikasi, dan akun aktif.
*/
Route::middleware(['auth', 'verified', 'is_active'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Modul Chat & Layanan Pesanan (Service Orders)
    Route::get('/services/{serviceOrder}/chat', [ChatController::class, 'getHistory'])->name('chat.history');
    Route::post('/services/{serviceOrder}/chat', [ChatController::class, 'sendManual'])->name('chat.send');
    Route::post('/services/{serviceOrder}/trigger-wa', [ServiceOrderController::class, 'triggerWhatsappOffer'])->name('services.trigger-wa');
    Route::get('/services/{serviceOrder}/print-ticket', [ServiceOrderController::class, 'printTicketPDF'])->name('services.print-ticket');
    Route::get('/services/{serviceOrder}/print-receipt', [ServiceOrderController::class, 'printTicketPDF'])->name('services.print-receipt');
    
    // API & Resource Service Orders
    Route::get('/api/search-customer', [ServiceOrderController::class, 'searchCustomer'])->name('api.search-customer');
    Route::resource('services', ServiceOrderController::class)
        ->parameters(['services' => 'serviceOrder'])
        ->only(['index', 'store', 'show', 'update', 'destroy']);
    
    // Kanban Board
    Route::get('/kanban', [ServiceOrderController::class, 'kanban'])->name('kanban.index');

    // Modul Garansi
    Route::resource('garansi', WarrantyController::class)
        ->parameters(['garansi' => 'warranty'])
        ->only(['index', 'update']);
    Route::post('/garansi/{warranty}/claim', [WarrantyController::class, 'claim'])->name('garansi.claim');

    // Modul Pelanggan
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');

    // Modul Notifikasi
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

/*
|--------------------------------------------------------------------------
| Administrator Only Routes
|--------------------------------------------------------------------------
| Hanya bisa diakses oleh user dengan role 'administrator'.
*/
Route::middleware(['auth', 'verified', 'is_active', 'role:administrator'])->group(function () {
    
    // Manajemen Pegawai
    Route::resource('pegawai', PegawaiController::class)->except(['create', 'edit']);
    Route::patch('pegawai/{pegawai}/toggle-status', [PegawaiController::class, 'toggleStatus'])->name('pegawai.toggle-status');
    Route::patch('/pegawai/{pegawai}/reset-password', [PegawaiController::class, 'resetPassword'])->name('pegawai.reset-password');

    // Hak Akses Ekstra Administrator
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    // Recycle Bin / Trash Management
    Route::get('/sampah', [TrashController::class, 'index'])->name('trash.index');
    Route::post('/sampah/{type}/{id}/restore', [TrashController::class, 'restore'])->name('trash.restore');
    Route::delete('/sampah/{type}/{id}/force-delete', [TrashController::class, 'forceDelete'])->name('trash.force-delete');

    // Konfigurasi WhatsApp API
    Route::get('config/wa', [ConfigWaController::class, 'index'])->name('config.wa');
    Route::post('config/wa/logout', [ConfigWaController::class, 'logout'])->name('config.wa.logout');
});

require __DIR__ . '/settings.php';
