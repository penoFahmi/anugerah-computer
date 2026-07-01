import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { CustomersPageProps } from '@/types/customer';
import { CustomerFilters } from '@/components/customers/customer-filters';
import { CustomerTable } from '@/components/customers/customer-table';

export default function CustomersList({
    customers,
    filters,
}: CustomersPageProps) {
    const { flash } = usePage<CustomersPageProps>().props;

    // Sentralisasi penangkapan Notifikasi/Toast
    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    return (
        <>
            <Head title="Manajemen Pelanggan" />
            <div className="flex flex-col space-y-6 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Pelanggan"
                        description="Kelola informasi dan data riwayat pelanggan Anugerah Computer"
                    />
                </div>

                <CustomerFilters filters={filters} />

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <CustomerTable customers={customers} />
                </div>
            </div>
        </>
    );
}

CustomersList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pelanggan', href: '/customers' }]}>
        {page}
    </AppLayout>
);
