import type { PaginatedData, GlobalPageProps } from './global';
import { SparePart } from './sparepart';

export interface Procurement {
    id: number;
    user: { id: number; name: string };
    amount: string;
    notes: string;
    transaction_date: string;
}

export interface ProcurementPageProps extends GlobalPageProps {
    procurements: PaginatedData<Procurement>;
    filters: {
        search: string | null;
    };
}