<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['customer_id', 'device_type', 'brand', 'model', 'serial_number'])]
class Device extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Relasi ke entitas Customer (Pemilik perangkat).
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Relasi ke riwayat pesanan servis untuk perangkat ini.
     */
    public function serviceOrders()
    {
        return $this->hasMany(ServiceOrder::class);
    }
}
