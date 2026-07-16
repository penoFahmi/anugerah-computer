<?php

namespace App\Enums;

enum ProductStatus: string
{
    case READY = 'ready';
    case BOOKED = 'booked';
    case SOLD = 'sold';

    public function label(): string
    {
        return match($this) {
            self::READY => 'Tersedia',
            self::BOOKED => 'Dipesan (Booking)',
            self::SOLD => 'Terjual',
        };
    }
}