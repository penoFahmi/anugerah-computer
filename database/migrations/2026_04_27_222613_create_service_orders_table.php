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
            $table->string('order_number')->unique();

            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('device_id')->constrained()->restrictOnDelete();

            $table->text('complaint');
            $table->json('equipments')->nullable();

            $table->string('status', 30)->default('waiting_checking')->index();

            $table->boolean('is_technician_on_site')->default(false);

            // Biaya
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->decimal('down_payment', 12, 2)->nullable();
            $table->decimal('final_cost', 12, 2)->nullable();

            $table->text('technician_notes')->nullable();

            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('technician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('handed_over_by')->nullable()->constrained('users')->nullOnDelete();

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
