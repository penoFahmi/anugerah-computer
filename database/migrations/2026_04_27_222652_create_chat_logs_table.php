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
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            // cascadeOnDelete: Jika order dihapus (force delete), log chat terkait order ini ikut terhapus
            $table->foreignId('service_order_id')->nullable()->constrained()->cascadeOnDelete();
            
            $table->string('wa_message_id')->unique()->nullable(); 
            
            // --- KEBUTUHAN NLP & CS ---
            $table->string('phone', 25)->nullable()->index();
            $table->string('sender_name', 100)->nullable();
            $table->string('message_type', 30)->default('text'); 
            
            // Arah pesan: 'inbound' (dari user) atau 'outbound' (dari bot/admin)
            $table->string('direction', 20)->index(); 
            $table->text('message'); 
            
            // --- AI & MACHINE LEARNING FIELDS ---
            // Menyimpan skor keyakinan NLP lokal (contoh: 0.9500)
            $table->decimal('svm_confidence_score', 5, 4)->nullable(); 
            $table->string('svm_predicted_intent')->nullable(); 
            $table->boolean('is_svm_successful')->nullable(); 
            
            // Data analitik untuk LLM (Large Language Model) seperti OpenAI/Gemini
            $table->boolean('is_llm_triggered')->default(false); 
            $table->json('llm_raw_response')->nullable(); 
            $table->integer('llm_prompt_tokens')->nullable(); // Untuk kalkulasi biaya API
            $table->integer('llm_completion_tokens')->nullable(); 
            
            // Intent final setelah divalidasi oleh sistem atau CS manusia
            $table->string('final_intent', 50)->nullable()->index(); 
            $table->string('resolved_by', 50)->nullable(); // AI, Bot, atau nama CS Manusia

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
