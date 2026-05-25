<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'service_order_id', 'wa_message_id', 'direction', 'message', 
    'ld_distance_score', 'ld_matched_keyword', 'is_ld_successful', 
    'is_llm_triggered', 'llm_raw_response', 'llm_prompt_tokens', 
    'llm_completion_tokens', 'final_intent', 'resolved_by'
])]
class ChatLog extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_ld_successful' => 'boolean',
            'is_llm_triggered' => 'boolean',
        ];
    }

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }
}