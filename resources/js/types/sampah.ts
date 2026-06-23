export interface TrashItem {
    id: number;
    type: 'pegawai' | 'servis' | 'customer' | 'perangkat';
    category_label: string;
    data_info: string;
    deleted_at: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedTrash {
    current_page: number;
    data: TrashItem[];
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

export interface TrashPageProps {
    trashItems: PaginatedTrash;
    filters: {
        search: string | null;
        type: string | null;
        per_page: string | null;
    };
    flash?: {
        toast: {
            type: 'success' | 'error' | 'warning' | 'info';
            message: string;
        } | null;
    };
}