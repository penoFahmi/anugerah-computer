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
        Schema::create('chat_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_order_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('wa_message_id')->unique()->nullable(); 
            
            $table->enum('direction', ['outbound', 'inbound']); 
            $table->text('message'); // Teks chat original
            
            // --- METRIK LEVENSHTEIN DISTANCE (Lapisan Pertama) ---
            $table->integer('ld_distance_score')->nullable(); 
            $table->string('ld_matched_keyword')->nullable(); 
            $table->boolean('is_ld_successful')->nullable(); 
            
            // --- METRIK LLM LARAVEL AI SDK (Lapisan Kedua) ---
            $table->boolean('is_llm_triggered')->default(false); 
            $table->text('llm_raw_response')->nullable(); 
            $table->integer('llm_prompt_tokens')->nullable(); // Untuk Analisis Biaya/Token di Bab 4
            $table->integer('llm_completion_tokens')->nullable(); 
            
            // --- KESIMPULAN INTENT ---
            // Niat: Setuju, Batal, Nego, atau Tidak Jelas
            $table->enum('final_intent', ['approve', 'cancel', 'negotiate', 'unclear'])->nullable(); 
            $table->enum('resolved_by', ['levenshtein', 'llm', 'human'])->nullable(); 

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_logs');
    }
};
