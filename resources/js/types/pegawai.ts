export interface Pegawai {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PegawaiPagination {
    data: Pegawai[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
}