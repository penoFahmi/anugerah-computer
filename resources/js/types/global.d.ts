import type { Auth } from '@/types/auth';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Gunakan Generic Type <T> agar bisa dipakai untuk model apa saja
export interface PaginatedData<T> {
    current_page: number;
    data: T[];
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

export interface GlobalPageProps {
    flash?: {
        toast?: {
            type: 'success' | 'error' | 'warning' | 'info';
            message: string;
        };
    };
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
