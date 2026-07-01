<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['service_order_id', 'warranty_code', 'start_date', 'end_date', 'status', 'claim_count', 'notes'])]
class Warranty extends Model
{
    use HasFactory;

    /**
     * Konversi tipe data atribut secara otomatis (Type Casting).
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'claim_count' => 'integer',
        ];
    }

    /**
     * Relasi ke entitas ServiceOrder (Pesanan servis yang mendasari garansi ini).
     */
    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }
}
