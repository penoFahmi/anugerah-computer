import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { TrashFilters } from '@/components/sampah/sampah-filters';
import { TrashTable } from '@/components/sampah/sampah-table';
import AppLayout from '@/layouts/app-layout';
import type { TrashPageProps } from '@/types/sampah';

export default function TrashList({ trashItems, filters }: TrashPageProps) {
    const { flash } = usePage<TrashPageProps>().props;

    // Mendengarkan flash message (toast) secara terpusat di level halaman (Page)
    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    return (
        <>
            <Head title="Tempat Sampah" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Tempat Sampah"
                    description="Kelola data yang telah dihapus sementara dari sistem."
                />
                
                {/* Komponen Filter & Pencarian */}
                <TrashFilters filters={filters} />

                {/* Komponen Tabel Data Sampah */}
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <TrashTable trashItems={trashItems} />
                </div>
            </div>
        </>
    );
}

// Persisten Layout standar Inertia
TrashList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Tempat Sampah', href: '/sampah' }]}>
        {page}
    </AppLayout>
);
