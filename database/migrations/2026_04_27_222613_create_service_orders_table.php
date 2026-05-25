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
        Schema::create('service_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // Format: SRV-YYYYMMDD-XXX
            
            // Relasi Entitas
            $table->foreignId('customer_id')->constrained();
            $table->foreignId('device_id')->constrained();
            
            // Detail Keluhan & Kelengkapan
            $table->text('complaint'); 
            $table->text('equipments')->nullable(); // Kelengkapan: Tas, Charger, Mouse
            
            // Tracking Status (Berdasarkan Flowchart Skripsi)
            $table->enum('status', [
                'waiting_checking', // Masuk antrean
                'waiting_approval', // Menunggu pelanggan membalas WA tagihan
                'approved',         // Pelanggan Setuju via AI / Manual
                'cancelled',        // Pelanggan Batal via AI / Manual
                'in_progress',      // Sedang dikerjakan teknisi
                'completed',        // Selesai dikerjakan
                'taken'             // Sudah diambil pelanggan
            ])->default('waiting_checking'); 
            
            $table->boolean('is_technician_on_site')->default(false); 
            
            // Biaya
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->decimal('down_payment', 12, 2)->nullable();
            $table->decimal('final_cost', 12, 2)->nullable();
            
            $table->text('technician_notes')->nullable(); 

            // Tracking Pegawai / Aktor
            $table->foreignId('created_by')->constrained('users'); // Yang input pertama
            $table->foreignId('technician_id')->nullable()->constrained('users'); // Teknisi yang menangani
            $table->foreignId('handed_over_by')->nullable()->constrained('users'); // Kasir/Pegawai penyerah barang
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_orders');
    }
};
