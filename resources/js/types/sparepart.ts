import type { PaginatedData, GlobalPageProps } from './global';

export interface SparePart {
    id: number;
    sku: string | null;
    name: string;
    purchase_price: string;
    selling_price: string;
    stock: number;
    is_always_indent: boolean;
}

export interface SparepartPageProps extends GlobalPageProps {
    spareparts: PaginatedData<SparePart>;
    filters: {
        search: string | null;
        filter_stock: string | null;
        filter_type: string | null;
        per_page: string | null;
    };
}