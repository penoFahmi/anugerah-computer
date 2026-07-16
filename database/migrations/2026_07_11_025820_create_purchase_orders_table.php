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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_number')->unique(); // Cth: BUY-20260717-001
            
            // Siapa orang yang menjual laptopnya ke toko? (Relasi ke tabel customer tunggal kita)
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            
            // Spesifikasi laptop yang kita beli dari orang tersebut
            $table->string('item_name')->comment('Cth: ASUS Vivobook Ultra A412');
            $table->string('serial_number')->nullable();
            $table->text('specification_summary')->comment('Ringkasan spek: RAM, Proc, dll');
            $table->text('condition_notes')->comment('Catatan minus atau kelengkapan saat kita beli');
            
            // Keuangan & Bukti Hukum
            $table->decimal('purchase_price', 12, 2)->comment('Uang modal yang dikeluarkan toko untuk membayar orang ini');
            $table->string('ktp_image_path')->comment('Wajib diisi! Menyimpan path foto KTP penjual untuk keamanan hukum');
            
            // Siapa pegawai toko yang melayani transaksi ini?
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
