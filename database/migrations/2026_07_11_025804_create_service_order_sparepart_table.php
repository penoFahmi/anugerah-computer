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
        Schema::create('service_order_sparepart', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_order_id')->constrained('service_orders')->cascadeOnDelete();
            $table->foreignId('spare_part_id')->constrained('spare_parts')->cascadeOnDelete();
            
            $table->integer('quantity')->default(1);
            $table->decimal('price', 12, 2)->comment('Harga snapshot saat dipesan');
            
            // [PERBAIKAN]: Ubah menjadi string, jangan pakai enum database!
            $table->string('status', 20)->default('ready');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_order_sparepart');
    }
};
