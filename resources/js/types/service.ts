export interface Device {
    id: number;
    device_type: string;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
}

export interface Customer {
    id: number;
    name: string;
    phone: string;
    devices?: Device[]; 
}

export interface ServiceListItem {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    device_name: string;
    complaint: string;
    status: string;
    status_label: string;
    estimated_cost: string | number | null;
    created_at: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedServiceOrders {
    current_page: number;
    data: ServiceListItem[];
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

export interface ServiceIndexProps {
    serviceOrders: PaginatedServiceOrders;
    filters: {
        search: string;
        status: string;
        per_page: string | number;
        date?: string;
        type?: string;
    };
}