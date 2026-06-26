<?php

namespace App\Models;

use App\Enums\ServiceStatus;
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
     * Konversi tipe data secara otomatis
     */
    protected function casts(): array
    {
        return [
            'status' => ServiceStatus::class,
            'equipments' => 'array',
            'is_technician_on_site' => 'boolean',
            'estimated_cost' => 'decimal:2',
            'down_payment' => 'decimal:2',
            'final_cost' => 'decimal:2',
        ];
    }

    /**
     * LOCAL SCOPE: Logika Pencarian (Search)
     * Ini yang dipanggil di Controller pakai ->search($kataKunci)
     */
    public function scopeSearch($query, $search)
    {
        // Kalau kolom search kosong, kembalikan query apa adanya
        if (empty($search)) {
            return $query;
        }

        // Bersihkan input, ambil angkanya saja untuk ngecek nomor HP
        $cleanSearch = preg_replace('/[^0-9]/', '', $search);
        $searchPhone = $search;

        // Logika mutator nomor HP (ubah 0 atau 8 jadi 62) untuk pencarian
        if (!empty($cleanSearch)) {
            if (str_starts_with($cleanSearch, '0')) {
                $searchPhone = '62' . substr($cleanSearch, 1);
            } elseif (str_starts_with($cleanSearch, '8')) {
                $searchPhone = '62' . $cleanSearch;
            } else {
                $searchPhone = $cleanSearch;
            }
        }

        // Lakukan pencarian ke order_number, nama customer, atau phone customer
        return $query->where(function ($q) use ($search, $searchPhone) {
            $q->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('customer', function ($qCustomer) use ($search, $searchPhone) {
                    $qCustomer->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$searchPhone}%");
                });
        });
    }

    /**
     * RELASI DATABASE
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
}
