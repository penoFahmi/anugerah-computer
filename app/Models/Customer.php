<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'phone', 'address'])]
class Customer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Mutator untuk memformat nomor telepon ke dalam standar internasional (kode negara 62).
     */
    protected function phone(): Attribute
    {
        return Attribute::make(
            set: function (string $value) {
                // 1. Hapus semua karakter non-numerik (spasi, tanda +, strip, dll.)
                $clean = preg_replace('/[^0-9]/', '', $value);

                // 2. Jika input diawali dengan '0' (Format lokal Indonesia), ubah menjadi awalan '62'
                if (str_starts_with($clean, '0')) {
                    return '62' . substr($clean, 1);
                }

                // 3. Jika input langsung diawali dengan awalan provider (misal: '812...'), tambahkan '62'
                if (str_starts_with($clean, '8')) {
                    return '62' . $clean;
                }

                // 4. Jika nomor sudah sesuai standar internasional ('62', '60', dll.), simpan tanpa modifikasi
                return $clean;
            },
        );
    }

    /**
     * Relasi ke entitas Device (Perangkat yang dimiliki pelanggan).
     */
    public function devices()
    {
        return $this->hasMany(Device::class);
    }

    /**
     * Relasi ke riwayat pesanan servis milik pelanggan.
     */
    public function serviceOrders()
    {
        return $this->hasMany(ServiceOrder::class);
    }
    public function chatLogs()
    {
        return $this->hasMany(ChatLog::class);
    }

    public function posTransactions()
    {
        return $this->hasMany(PosTransaction::class);
    }
    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
