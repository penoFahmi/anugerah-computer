<?php

namespace App\Models;

use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'slug',
    'name',
    'brand',
    'processor',
    'ram',
    'storage',
    'vga',
    'condition_notes',
    'purchase_price',
    'selling_price',
    'image_path',
    'warranty_days',
    'status'
])]
class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'purchase_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'warranty_days' => 'integer',
            'status' => ProductStatus::class,
        ];
    }

    public function onlineBookings()
    {
        return $this->hasMany(OnlineBooking::class);
    }

    public function posTransactionItems()
    {
        return $this->hasMany(PosTransactionItem::class);
    }
}
