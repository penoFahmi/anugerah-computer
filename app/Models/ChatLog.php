<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'service_order_id', 'wa_message_id', 'direction', 'message', 
    'svm_confidence_score', 'svm_predicted_intent', 'is_svm_successful',
    'is_llm_triggered', 'llm_raw_response', 'llm_prompt_tokens', 
    'llm_completion_tokens', 'final_intent', 'resolved_by'
])]
class ChatLog extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'svm_confidence_score' => 'decimal:4',
            'is_svm_successful' => 'boolean',
            'is_llm_triggered' => 'boolean',
            'llm_raw_response' => 'array',
        ];
    }

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }
}
