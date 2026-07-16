import type { PaginatedData, GlobalPageProps } from './global';

export interface Product {
    id: number;
    slug: string;
    name: string;
    brand: string | null;
    processor: string | null;
    ram: string | null;
    storage: string | null;
    vga: string | null;
    condition_notes: string | null;
    purchase_price: string;
    selling_price: string;
    image_path: string | null;
    warranty_days: number;
    status: 'ready' | 'booked' | 'sold';
}

export interface ProductPageProps extends GlobalPageProps {
    products: PaginatedData<Product>;
    filters: {
        search: string | null;
        filter_status: string | null;
    };
}