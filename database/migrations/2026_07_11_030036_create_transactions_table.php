<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            
            // [PERBAIKAN]: Harus Nullable! Karena tidak semua transaksi berasal dari nota servis
            $table->foreignId('service_order_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete(); // Pegawai yang mencatat
            
            // Jenis Transaksi & Kategori (Pakai string agar dikendalikan lewat Enum PHP)
            $table->string('type', 20)->default('income'); // 'income' atau 'expense'
            $table->string('category', 50)->default('dp_servis'); 
            
            $table->decimal('amount', 12, 2);
            $table->string('payment_method')->default('cash'); // cash, qris, transfer
            $table->text('notes')->nullable();
            
            $table->timestamp('transaction_date')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
