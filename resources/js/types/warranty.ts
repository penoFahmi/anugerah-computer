import type { PaginatedData, GlobalPageProps } from './global';

export interface WarrantyListItem {
    id: number;
    warranty_code: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    device_name: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'expired' | 'claimed' | 'void';
    claim_count: number;
    notes: string | null;
}

export interface WarrantyIndexProps extends GlobalPageProps {
    warranties: PaginatedData<WarrantyListItem>;
    filters: {
        search: string;
        status: string;
        per_page: string | number;
        date?: string;
        type?: string;
    };
}