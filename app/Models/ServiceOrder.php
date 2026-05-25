<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'order_number', 'customer_id', 'device_id', 'complaint', 'equipments', 
    'status', 'is_technician_on_site', 'estimated_cost', 'down_payment', 
    'final_cost', 'technician_notes', 'created_by', 'technician_id', 'handed_over_by'
])]
class ServiceOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_technician_on_site' => 'boolean',
            'estimated_cost' => 'decimal:2',
            'down_payment' => 'decimal:2',
            'final_cost' => 'decimal:2',
        ];
    }

    // Relasi ke Data Pelanggan & Unit
    public function customer() { return $this->belongsTo(Customer::class); }
    public function device() { return $this->belongsTo(Device::class); }

    // Relasi ke Log AI (Untuk Skripsi)
    public function chatLogs() { return $this->hasMany(ChatLog::class); }
    
    // Relasi ke Garansi
    public function warranty() { return $this->hasOne(Warranty::class); }

    // Relasi Tracking Pegawai (Aktor)
    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }
    public function technician() { return $this->belongsTo(User::class, 'technician_id'); }
    public function handedOverBy() { return $this->belongsTo(User::class, 'handed_over_by'); }
}