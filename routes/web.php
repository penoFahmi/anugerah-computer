<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\ConfigWaController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Finance\CashflowController;
use App\Http\Controllers\Finance\ProfitLossController;
use App\Http\Controllers\Inventory\ProcurementController;
use App\Http\Controllers\Inventory\ProductController;
use App\Http\Controllers\Inventory\SparePartController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\Sales\OnlineBookingController;
use App\Http\Controllers\Sales\PosController;
use App\Http\Controllers\Sales\TradeInController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\Settings\LogController;
use App\Http\Controllers\TrashController;
use App\Http\Controllers\WarrantyController;
/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingController::class, 'index'])->name('home');

/*
|--------------------------------------------------------------------------
| Authenticated User Routes (Pegawai, Teknisi, Administrator)
|--------------------------------------------------------------------------
| Berlaku untuk semua user yang sudah login, email terverifikasi, dan akun aktif.
*/
Route::middleware(['auth', 'verified', 'is_active'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Modul Chat & Layanan Pesanan (Service Orders)
    Route::get('/api/chats/{phone}', [ChatController::class, 'getHistoryByPhone'])->name('chat.history.phone');
    Route::post('/api/chats/{phone}', [ChatController::class, 'sendManualByPhone'])->name('chat.send.phone');
    Route::post('/services/{serviceOrder}/trigger-wa', [ServiceOrderController::class, 'triggerWhatsappOffer'])->name('services.trigger-wa');
    Route::get('/services/{serviceOrder}/print-ticket', [ServiceOrderController::class, 'printTicketPDF'])->name('services.print-ticket');
    Route::get('/services/{serviceOrder}/print-receipt', [ServiceOrderController::class, 'printTicketPDF'])->name('services.print-receipt');

    // API & Resource Service Orders
    Route::get('/api/search-customer', [ServiceOrderController::class, 'searchCustomer'])->name('api.search-customer');
    Route::post('/services/{serviceOrder}/spareparts', [ServiceOrderController::class, 'attachSparepart'])
        ->name('services.spareparts.attach');
    Route::resource('services', ServiceOrderController::class)
        ->parameters(['services' => 'serviceOrder'])
        ->only(['index', 'store', 'show', 'update', 'destroy']);

    // Kanban Board
    Route::get('/kanban', [ServiceOrderController::class, 'kanban'])->name('kanban.index');

    // Modul POS (Point of Sale) & Sales
    Route::resource('sales/pos', PosController::class)
        ->parameters(['pos' => 'posTransaction'])
        ->only(['index', 'store']);
    Route::get('sales/trade-in', [TradeInController::class, 'index'])->name('sales.trade-in.index');
    Route::post('sales/trade-in', [TradeInController::class, 'store'])->name('sales.trade-in.store');
    Route::get('sales/online', [OnlineBookingController::class, 'index'])->name('sales.online.index');

    // Modul Keuangan
    Route::get('finance/cashflow', [CashflowController::class, 'index'])->name('finance.cashflow.index');
    Route::get('finance/profit-loss', [ProfitLossController::class, 'index'])->name('finance.profit-loss.index');

    // Modul Garansi
    Route::resource('garansi', WarrantyController::class)
        ->parameters(['garansi' => 'warranty'])
        ->only(['index', 'update']);
    Route::post('/garansi/{warranty}/claim', [WarrantyController::class, 'claim'])->name('garansi.claim');

    // Modul Pelanggan
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');

    // Modul Sparepart / Inventory
    Route::resource('inventory/spareparts', SparePartController::class)
        ->parameters(['spareparts' => 'sparepart'])
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('inventory/procurement', ProcurementController::class)->only(['index', 'store']);
    Route::resource('inventory/products', ProductController::class)
        ->parameters(['products' => 'product'])
        ->only(['index', 'store', 'update', 'destroy']);

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

    // Konfigurasi WhatsApp API & Logs
    Route::get('config/wa', [ConfigWaController::class, 'index'])->name('config.wa');
    Route::post('config/wa/logout', [ConfigWaController::class, 'logout'])->name('config.wa.logout');
    Route::get('settings/logs', [LogController::class, 'index'])->name('settings.logs.index');
});

require __DIR__.'/settings.php';
