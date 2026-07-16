<?php

namespace App\Models;

use App\Enums\SparepartStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'sku',
    'name',
    'purchase_price',
    'selling_price',
    'stock',
    'is_always_indent'
])]
class SparePart extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Konversi tipe data atribut secara otomatis (Type Casting).
     */
    protected function casts(): array
    {
        return [
            'purchase_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'stock' => 'integer',
            'is_always_indent' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relasi Model
    |--------------------------------------------------------------------------
    */

    /**
     * Relasi ke Nota Servis (Banyak ke Banyak).
     * Disertai pengambilan data Pivot dan casting Enum untuk status pivot.
     */
    public function serviceOrders()
    {
        return $this->belongsToMany(ServiceOrder::class, 'service_order_sparepart')
            ->withPivot(['quantity', 'price', 'status'])
            ->withCasts(['status' => SparepartStatus::class])
            ->withTimestamps();
    }

    /**
     * Relasi ke Struk Penjualan POS Kasir
     */
    public function posTransactionItems()
    {
        return $this->hasMany(PosTransactionItem::class);
    }
}
