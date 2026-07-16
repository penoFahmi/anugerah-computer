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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('brand', 50)->nullable();
            $table->string('processor', 100)->nullable();
            $table->string('ram', 50)->nullable();
            $table->string('storage', 100)->nullable();
            $table->string('vga', 100)->nullable();
            $table->text('condition_notes')->nullable();
            $table->decimal('purchase_price', 12, 2)->default(0);
            $table->decimal('selling_price', 12, 2)->default(0);
            $table->string('image_path')->nullable();
            $table->integer('warranty_days')->default(30);
            
            // Status ketersediaan laptop second (karena unitnya unik/cuma ada 1)
            // ready = tampil di web, booked = sedang dikunci orang via WA, sold = terjual/hilang dari web
            $table->string('status', 20)->default('ready')->index();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
