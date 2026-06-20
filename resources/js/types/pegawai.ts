export interface Role {
    id: number;
    name: string;
}

export interface Pegawai {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
    is_active: boolean;
    role: string;
    reset_password: boolean;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedPegawai {
    current_page: number;
    data: Pegawai[];
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

export interface PegawaiPageProps {
    pegawais: PaginatedPegawai;
    roles: Role[];
    filters: {
        search: string | null;
        status: string | null;
        role: string | null;
    };
    flash?: {
        toast: {
            type: 'success' | 'error' | 'warning' | 'info';
            message: string;
        } | null;
    };
}