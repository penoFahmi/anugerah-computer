<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_order_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('wa_message_id')->unique()->nullable(); 
            
            // --- KEBUTUHAN NLP & CS ---
            $table->string('phone', 25)->nullable()->index();
            $table->string('sender_name', 100)->nullable();
            $table->string('message_type', 30)->default('text');
            
            $table->string('direction', 20)->index(); 
            $table->text('message'); 
            
            // NLP & AI Fields
            $table->decimal('svm_confidence_score', 5, 4)->nullable(); 
            $table->string('svm_predicted_intent')->nullable(); 
            $table->boolean('is_svm_successful')->nullable(); 
            
            $table->boolean('is_llm_triggered')->default(false); 
            $table->json('llm_raw_response')->nullable(); 
            $table->integer('llm_prompt_tokens')->nullable(); 
            $table->integer('llm_completion_tokens')->nullable(); 
            
            // FINAL FIX: String + Index
            $table->string('final_intent', 50)->nullable()->index(); 
            $table->string('resolved_by', 50)->nullable(); 

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
