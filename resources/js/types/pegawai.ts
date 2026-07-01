import type { PaginatedData, GlobalPageProps } from './global';

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
}

export interface PegawaiPageProps extends GlobalPageProps {
    pegawais: PaginatedData<Pegawai>; // <-- Menggunakan Generic Type
    roles: Role[];
    filters: {
        search: string | null;
        status: string | null;
        role: string | null;
        per_page: string | null;
    };
}