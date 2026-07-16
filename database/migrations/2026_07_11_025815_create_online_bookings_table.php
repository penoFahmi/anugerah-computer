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
        Schema::create('online_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number')->unique(); // Cth: BKG-20260717-001
            
            // Relasi ke laptop yang diboking
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            
            // Data orang yang boking (diisi di landing page)
            $table->string('customer_name');
            $table->string('customer_phone', 25);
            
            // Status Booking
            // pending = baru boking & otw chat WA, confirmed = admin sudah verifikasi dichat,
            // success = orangnya sudah datang & bayar di toko, cancelled = batal/lewat batas waktu boking
            $table->string('status', 25)->default('pending')->index();
            
            $table->timestamp('expires_at')->nullable()->comment('Batas waktu boking, cth: 1x24 jam');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('online_bookings');
    }
};
