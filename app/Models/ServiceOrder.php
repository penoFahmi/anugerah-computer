<?php

namespace App\Models;

use App\Enums\ServiceStatus;
use App\Enums\SparepartStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'order_number',
    'customer_id',
    'device_id',
    'complaint',
    'equipments',
    'status',
    'is_technician_on_site',
    'is_unit_left_at_store',
    'estimated_cost',
    'down_payment',
    'final_cost',
    'technician_notes',
    'created_by',
    'technician_id',
    'handed_over_by'
])]
class ServiceOrder extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Konversi tipe data atribut secara otomatis (Type Casting).
     */
    protected function casts(): array
    {
        return [
            'status' => ServiceStatus::class,
            'equipments' => 'array',
            'is_technician_on_site' => 'boolean',
            'is_unit_left_at_store' => 'boolean',
            'estimated_cost' => 'decimal:2',
            'down_payment' => 'decimal:2',
            'final_cost' => 'decimal:2',
        ];
    }

    /**
     * Local Scope: Menyaring pesanan berdasarkan kata kunci pencarian.
     * Mencakup pencarian berdasarkan Nomor Order, Nama Pelanggan, atau Nomor Telepon.
     */
    public function scopeSearch($query, $search)
    {
        // Lewati filter jika kata kunci pencarian kosong
        if (empty($search)) {
            return $query;
        }

        // Ekstraksi angka untuk pencocokan nomor telepon (mengakomodasi format mutator)
        $cleanSearch = preg_replace('/[^0-9]/', '', $search);
        $searchPhone = $search;

        if (!empty($cleanSearch)) {
            if (str_starts_with($cleanSearch, '0')) {
                $searchPhone = '62' . substr($cleanSearch, 1);
            } elseif (str_starts_with($cleanSearch, '8')) {
                $searchPhone = '62' . $cleanSearch;
            } else {
                $searchPhone = $cleanSearch;
            }
        }

        // Aplikasikan klausa pencarian dengan relasi bersarang
        return $query->where(function ($q) use ($search, $searchPhone) {
            $q->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('customer', function ($qCustomer) use ($search, $searchPhone) {
                    $qCustomer->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$searchPhone}%");
                });
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relasi Model
    |--------------------------------------------------------------------------
    */

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function chatLogs()
    {
        return $this->hasMany(ChatLog::class);
    }

    public function warranty()
    {
        return $this->hasOne(Warranty::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function handedOverBy()
    {
        return $this->belongsTo(User::class, 'handed_over_by');
    }
    public function spareParts()
    {
        return $this->belongsToMany(SparePart::class, 'service_order_sparepart')
            ->withPivot(['quantity', 'price', 'status'])
            ->withCasts(['status' => SparepartStatus::class])
            ->withTimestamps();
    }
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
