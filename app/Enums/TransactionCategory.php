<?php
namespace App\Enums;

enum TransactionCategory: string
{
    case DP_SERVICE = 'dp_servis';
    case FINAL_SERVICE = 'pelunasan_servis';
    case POS_RETAIL = 'penjualan_kasir';
    case TRADE_IN = 'pembelian_bekas';
    case BUY_SPAREPART = 'pembelian_stok_sparepart';
    case OPERATIONAL = 'operasional_toko';
    case REFUND = 'pengembalian_dana';

    public function label(): string
    {
        return match($this) {
            self::DP_SERVICE => 'DP Servis',
            self::FINAL_SERVICE => 'Pelunasan Servis',
            self::POS_RETAIL => 'Penjualan Toko (POS)',
            self::TRADE_IN => 'Membeli Unit Bekas',
            self::BUY_SPAREPART => 'Belanja Stok / Sparepart',
            self::OPERATIONAL => 'Biaya Operasional Toko',
            self::REFUND => 'Refund Pelanggan',
        };
    }
}