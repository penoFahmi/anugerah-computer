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

export interface PaginatedWarranties {
    current_page: number;
    data: WarrantyListItem[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    per_page: number;
    to: number | null;
    total: number;
}

export interface WarrantyIndexProps {
    warranties: PaginatedWarranties;
    filters: {
        search: string;
        status: string;
        per_page: string | number;
    };
}