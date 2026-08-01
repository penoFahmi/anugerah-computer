import type { PaginatedData, GlobalPageProps } from './global';

export type ServiceStatus = 'waiting_checking' | 'waiting_approval' | 'approved' | 'cancelled' | 'in_progress' | 'completed' | 'taken' | 'returned';

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
    send_wa: boolean;
    status: ServiceStatus | string;
    status_label: string;
    estimated_cost: string | number | null;
    final_cost?: string | number | null;
    down_payment?: string | number | null;
    financials: {
        estimated: string | number | null;
        final: string | number | null;
        dp: string | number | null;
        remaining: number;
    };
    technician_notes?: string | null;
    is_unit_left_at_store: boolean;
    spare_parts?: any[];
    created_at: string;
    device_type?: string;
    brand?: string;
    model?: string;
    equipments?: string[];
}

export interface ServiceIndexProps extends GlobalPageProps {
    serviceOrders: PaginatedData<ServiceListItem>;
    filters: {
        search: string;
        status: string;
        per_page: string | number;
        date?: string;
        type?: string;
    };
}