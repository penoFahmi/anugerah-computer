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

    /*
     * Mutator untuk menyimpan nomor telepon dalam format internasional (62xxx)
     */
    protected function phone(): Attribute
    {
        return Attribute::make(
            set: function (string $value) {
                // 1. Buang semua karakter aneh (spasi, tanda +, strip, dll)
                $clean = preg_replace('/[^0-9]/', '', $value);

                // 2. Jika kasir ngetik manual pakai '0' di depan (Asumsi Indonesia) -> ubah ke '62'
                if (str_starts_with($clean, '0')) {
                    return '62' . substr($clean, 1);
                }

                // 3. Jika kasir ngetik langsung '812...' -> tambahkan '62'
                if (str_starts_with($clean, '8')) {
                    return '62' . $clean;
                }

                // 4. Jika nomor sudah berawalan '62', '60', '66', dll -> simpan murni apa adanya
                return $clean;
            },
        );
    }

    public function devices()
    {
        return $this->hasMany(Device::class);
    }

    public function serviceOrders()
    {
        return $this->hasMany(ServiceOrder::class);
    }
}
