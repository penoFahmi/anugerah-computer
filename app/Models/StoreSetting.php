<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    protected $guarded = [];

    protected $casts = [
        'slider_images' => 'array',
        'services' => 'array',
        'features' => 'array',
    ];
}
