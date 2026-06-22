export interface Customer {
    id: number;
    name: string;
    phone: string | null;
    service_orders_count: number; // ⬅️ UBAH INI: Menyesuaikan dengan backend baru
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedCustomer {
    current_page: number;
    data: Customer[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface CustomersPageProps {
    customers: PaginatedCustomer;
    filters: {
        search: string | null;
        status: string | null;
        role: string | null;
        per_page: string | null;
    };
    flash?: {
        toast: {
            type: 'success' | 'error' | 'warning' | 'info';
            message: string;
        } | null;
    };
}