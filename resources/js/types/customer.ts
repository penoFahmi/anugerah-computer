import type { PaginatedData, GlobalPageProps } from './global';

export interface Customer {
    id: number;
    name: string;
    phone: string | null;
    address: string;
    service_orders_count: number;
    last_service_date: string;
}

export interface CustomersPageProps extends GlobalPageProps {
    customers: PaginatedData<Customer>;
    filters: {
        search: string | null;
        per_page: string | null;
    };
}