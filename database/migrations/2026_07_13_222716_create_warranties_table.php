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
        Schema::create('warranties', function (Blueprint $table) {
            $table->id();

            // Jika service_order dihapus, data garansinya juga otomatis terhapus
            // $table->foreignId('service_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_order_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('pos_transaction_id')->nullable()->constrained('pos_transactions')->cascadeOnDelete();

            $table->string('warranty_code')->unique();
            $table->date('start_date');

            // Index pada end_date sangat berguna untuk query Cron Job (misal: mencari garansi yang kedaluwarsa hari ini)
            $table->date('end_date')->index();

            $table->string('status', 30)->default('active')->index(); // active, expired, void
            $table->integer('claim_count')->default(0); // Melacak berapa kali customer klaim garansi ini
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warranties');
    }
};
