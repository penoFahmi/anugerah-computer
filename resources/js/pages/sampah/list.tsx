import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { TrashFilters } from '@/components/sampah/sampah-filters';
import { TrashTable } from '@/components/sampah/sampah-table';
import AppLayout from '@/layouts/app-layout';
import type { TrashPageProps } from '@/types/sampah';

export default function TrashList({ trashItems, filters }: TrashPageProps) {
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

                {/* Tabel*/}
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <TrashTable trashItems={trashItems} />
                </div>
            </div>
        </>
    );
}

TrashList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Tempat Sampah', href: '/sampah' }]}>
        {page}
    </AppLayout>
);