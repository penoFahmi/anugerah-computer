<?php

namespace App\Enums;

enum SparepartStatus: string
{
    case READY = 'ready';
    case INDENTING = 'indenting';
    case INSTALLED = 'installed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::READY => 'Stok Tersedia',
            self::INDENTING => 'Sedang Di-Inden',
            self::INSTALLED => 'Sudah Dipasang',
            self::CANCELLED => 'Dibatalkan',
        };
    }
}