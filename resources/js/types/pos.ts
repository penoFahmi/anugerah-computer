import type { GlobalPageProps } from './global';

export interface PosProduct {
    id: number;
    slug: string;
    name: string;
    selling_price: string;
    image_path: string | null;
    ram: string | null;
    storage: string | null;
    type: 'product'; // Penanda bahwa ini Laptop
}

export interface PosSparepart {
    id: number;
    sku: string | null;
    name: string;
    selling_price: string;
    stock: number;
    type: 'sparepart'; // Penanda bahwa ini Sparepart
}

// Tipe data untuk item di dalam keranjang belanja
export interface CartItem {
    id: number;
    type: 'product' | 'sparepart';
    name: string;
    price: number;
    quantity: number;
    maxStock: number; // Untuk membatasi maksimal jumlah yang bisa dibeli
}

export interface PosPageProps extends GlobalPageProps {
    products: PosProduct[];
    spareparts: PosSparepart[];
}