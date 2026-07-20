<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'intent_name',
    'response_text',
])]
class BotAutoReply extends Model
{
    use HasFactory;
}
