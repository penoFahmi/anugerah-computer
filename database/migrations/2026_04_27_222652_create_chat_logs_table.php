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
            
            // --- METRIK PENGANALAN POLA: FASTTEXT + SVM (Lapisan Pertama) ---
            $table->float('svm_confidence_score')->nullable(); // Skor Probabilitas (0.00 - 1.00)
            $table->string('svm_predicted_intent')->nullable(); // Hasil tebakan awal SVM
            $table->boolean('is_svm_successful')->nullable(); // True jika skor >= 0.75 (Threshold)
            
            // --- METRIK LLM LARAVEL AI SDK (Lapisan Kedua / Fallback) ---
            $table->boolean('is_llm_triggered')->default(false); // True jika skor SVM < 0.75
            $table->text('llm_raw_response')->nullable(); // Jawaban asli format JSON dari LLM
            $table->integer('llm_prompt_tokens')->nullable(); // Untuk Analisis Biaya/Token di Bab 4 Skripsi
            $table->integer('llm_completion_tokens')->nullable(); 
            
            // --- KESIMPULAN AKHIR INTENT (Yang menentukan update status) ---
            // Niat: Setuju, Batal, Tanya Status, Konsultasi Teknis, atau Tidak Jelas
            $table->enum('final_intent', ['approve', 'cancel', 'status_inquiry', 'technical_consultation', 'unclear'])->nullable(); 
            
            // Pihak yang menyelesaikan/mendeteksi pesan ini
            $table->enum('resolved_by', ['svm_lokal', 'llm_cloud', 'human_admin'])->nullable(); 

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