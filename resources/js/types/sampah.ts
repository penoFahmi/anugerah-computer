import type { PaginatedData, GlobalPageProps } from './global';

export interface TrashItem {
    id: number;
    type: 'pegawai' | 'servis' | 'customer' | 'perangkat';
    category_label: string;
    data_info: string;
    deleted_at: string;
}

export interface TrashPageProps extends GlobalPageProps {
    trashItems: PaginatedData<TrashItem>; // <-- Menggunakan Generic Type
    filters: {
        search: string | null;
        type: string | null;
        per_page: string | null;
    };
}