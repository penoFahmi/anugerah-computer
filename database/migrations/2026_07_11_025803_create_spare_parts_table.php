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
        Schema::create('spare_parts', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique()->nullable()->comment('Kode unik barang');
            $table->string('name');
            $table->decimal('purchase_price', 12, 2)->default(0)->comment('Harga beli / modal');
            $table->decimal('selling_price', 12, 2)->default(0)->comment('Harga jual ke pelanggan');
            
            $table->integer('stock')->default(0); 
            
            $table->boolean('is_always_indent')->default(false)->comment('True jika barang jarang distok');
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_parts');
    }
};
