<?php

namespace App\Models;

use App\Enums\ServiceStatus;
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
            'status' => ServiceStatus::class, // Mapping otomatis ke Enum
            'equipments' => 'array', // Konversi JSON ke Array PHP otomatis
            'is_technician_on_site' => 'boolean',
            'estimated_cost' => 'decimal:2',
            'down_payment' => 'decimal:2',
            'final_cost' => 'decimal:2',
        ];
    }

    public function customer() { return $this->belongsTo(Customer::class); }
    public function device() { return $this->belongsTo(Device::class); }
    public function chatLogs() { return $this->hasMany(ChatLog::class); }
    public function warranty() { return $this->hasOne(Warranty::class); }
    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }
    public function technician() { return $this->belongsTo(User::class, 'technician_id'); }
    public function handedOverBy() { return $this->belongsTo(User::class, 'handed_over_by'); }
}
