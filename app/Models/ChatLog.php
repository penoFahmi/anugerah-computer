<?php

namespace App\Models;

use App\Events\NewChatMessage;
use App\Events\ChatRequiresHuman;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'customer_id',
    'service_order_id',
    'wa_message_id',
    'phone',
    'sender_name',
    'message_type',
    'direction',
    'message',
    'svm_confidence_score',
    'svm_predicted_intent',
    'is_svm_successful',
    'is_llm_triggered',
    'llm_raw_response',
    'llm_prompt_tokens',
    'llm_completion_tokens',
    'final_intent',
    'resolved_by'
])]
class ChatLog extends Model
{
    use HasFactory;

    /**
     * Konversi tipe data atribut secara otomatis (Type Casting).
     */
    protected function casts(): array
    {
        return [
            'svm_confidence_score' => 'decimal:4',
            'is_svm_successful' => 'boolean',
            'is_llm_triggered' => 'boolean',
            'llm_raw_response' => 'array',
        ];
    }

    /**
     * Relasi ke entitas ServiceOrder.
     */
    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }

    /**
     * Bootstrap model dan mengatur event listener untuk Real-Time Broadcasting (Laravel Reverb).
     */
    protected static function booted(): void
    {
        // 1. Broadcast event ketika ada pesan baru (dari Pelanggan, AI, atau Agen) untuk pembaruan UI secara real-time.
        static::created(function ($chatLog) {
            broadcast(new NewChatMessage($chatLog));
        });

        // 2. Broadcast event eskalasi ketika AI mengalihkan percakapan ke Agen Manusia (Customer Service).
        static::updated(function ($chatLog) {
            if ($chatLog->isDirty('resolved_by') && $chatLog->resolved_by === 'human') {
                broadcast(new ChatRequiresHuman($chatLog));
            }
        });
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
