<?php

namespace App\Enums;

enum ServiceStatus: string
{
    case WAITING_CHECKING = 'waiting_checking';
    case WAITING_APPROVAL = 'waiting_approval';
    case APPROVED = 'approved';
    case CANCELLED = 'cancelled';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case TAKEN = 'taken';
    case RETURNED = 'returned';

    /**
     * Mengembalikan label yang ramah pengguna (User-Friendly Label).
     */
    public function label(): string
    {
        return match($this) {
            self::WAITING_CHECKING => 'Menunggu Dicek',
            self::WAITING_APPROVAL => 'Menunggu Konfirmasi',
            self::APPROVED => 'Disetujui',
            self::CANCELLED => 'Dibatalkan',
            self::IN_PROGRESS => 'Sedang Diperbaiki',
            self::COMPLETED => 'Selesai',
            self::TAKEN => 'Sudah Diambil (Sukses)',
            self::RETURNED => 'Dikembalikan (Batal)',
        };
    }
}