<?php

namespace App\Models;

use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'service_order_id',
    'pos_transaction_id',
    'purchase_order_id',
    'user_id',
    'type',
    'category',
    'amount',
    'payment_method',
    'notes',
    'transaction_date'
])]
class Transaction extends Model
{
    use HasFactory;

    /**
     * Konversi tipe data atribut secara otomatis (Type Casting).
     */
    protected function casts(): array
    {
        return [
            'type' => TransactionType::class,
            'category' => TransactionCategory::class,
            'amount' => 'decimal:2',
            'transaction_date' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relasi Model
    |--------------------------------------------------------------------------
    */

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function posTransaction()
    {
        return $this->belongsTo(PosTransaction::class);
    }

    // [BARU] Relasi ke Pembelian Bekas
    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Local Scopes (Mempermudah Laporan Keuangan)
    |--------------------------------------------------------------------------
    */

    public function scopeIncomes($query)
    {
        return $query->where('type', TransactionType::INCOME);
    }

    public function scopeExpenses($query)
    {
        return $query->where('type', TransactionType::EXPENSE);
    }
}
