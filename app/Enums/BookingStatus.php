<?php

namespace App\Enums;

enum BookingStatus: string
{
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case SUCCESS = 'success';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Menunggu Konfirmasi WA',
            self::CONFIRMED => 'Terkonfirmasi (Menunggu di Toko)',
            self::SUCCESS => 'Selesai (Sudah Diambil)',
            self::CANCELLED => 'Dibatalkan / Kadaluarsa',
        };
    }
}