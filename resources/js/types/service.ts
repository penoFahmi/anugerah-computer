export interface Customer {
    id: number;
    name: string;
    phone: string;
    address?: string;
}

export interface Device {
    id: number;
    customer_id: number;
    device_type: string;
    brand: string;
    model: string;
    serial_number?: string;
}

export interface ServiceOrder {
    id: number;
    order_number: string;
    customer_id: number;
    device_id: number;
    complaint: string;
    equipments?: string;
    status: string;
    is_technician_on_site: boolean;
    estimated_cost: number | null;
    down_payment: number | null;
    final_cost: number | null;
    technician_notes?: string;
    customer?: Customer;
    device?: Device;
    created_at: string;
}

export interface ServicePagination {
    data: ServiceOrder[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number;
    to: number;
}