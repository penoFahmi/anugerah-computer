<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'pos_transaction_id',
    'spare_part_id',
    'product_id',
    'quantity',
    'price',
    'subtotal'
])]
class PosTransactionItem extends Model
{
    use HasFactory;

    /**
     * Konversi tipe data atribut secara otomatis (Type Casting).
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'price' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relasi Model
    |--------------------------------------------------------------------------
    */

    public function posTransaction()
    {
        return $this->belongsTo(PosTransaction::class);
    }

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
