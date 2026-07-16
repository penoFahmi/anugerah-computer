<?php

namespace App\Enums;

enum WarrantyStatus: string
{
    case ACTIVE = 'active';
    case EXPIRED = 'expired';
    case VOID = 'void';

    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Aktif',
            self::EXPIRED => 'Kedaluwarsa',
            self::VOID => 'Hangus / Batal',
        };
    }
}