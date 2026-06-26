import { Head, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import Heading from '@/components/heading';
import { ServiceFilterBar } from '@/components/services/service-filter-bar';
import { ServiceFormModal } from '@/components/services/service-form-modal';
import { ServiceProcessModal } from '@/components/services/service-process-modal';
import { ServiceStatusTabs } from '@/components/services/service-status-tabs';
import { ServiceTable } from '@/components/services/service-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { ServiceIndexProps, ServiceListItem } from '@/types/service';

export default function ServicesIndex({ serviceOrders, filters }: ServiceIndexProps) {
    const { flash } = usePage<ServiceIndexProps>().props;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedServiceToProcess, setSelectedServiceToProcess] = useState<ServiceListItem | null>(null);

    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        status: filters.status ?? 'all',
        per_page: filters.per_page?.toString() ?? '5',
    });

    useEffect(() => {
        if (flash?.toast) {
            if (flash.toast.type === 'success') toast.success(flash.toast.message);
            if (flash.toast.type === 'error') toast.error(flash.toast.message);
            if (flash.toast.type === 'warning') toast.warning(flash.toast.message);
            if (flash.toast.type === 'info') toast.info(flash.toast.message);
        }
    }, [flash]);

    const handleSearchDebounce = useDebouncedCallback((value: string) => {
        applyFilters({ ...filterState, search: value });
    }, 400);

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};

        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.status !== 'all') query.status = newFilters.status;
        if (newFilters.per_page !== '5') query.per_page = newFilters.per_page;

        router.get('/services', query, { 
            preserveState: true, 
            preserveScroll: true,
            replace: true 
        });
    };

    const handleFilterChange = (key: keyof typeof filterState, value: string) => {
        const newFilters = { ...filterState, [key]: value };
        setFilterState(newFilters);
        applyFilters(newFilters);
    };

    const handleResetFilters = () => {
        const defaultFilters = { search: '', status: 'all', per_page: '5' };
        setFilterState(defaultFilters);
        router.get('/services', {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Pusat Servis" />
            
            {/* 100% MENGIKUTI STRUKTUR DASHBOARD.TSX */}
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                
                {/* BAGIAN ATAS: Grid tumpuk vertikal (tanpa md:grid-cols-3 agar tidak gepeng ke samping) */}
                <div className="grid auto-rows-min gap-4">
                    
                    {/* Placeholder 1 -> Diganti Header */}
                    <div className="relative overflow-hidden rounded-xl">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <Heading
                                title="Pusat Servis"
                                description="Manajemen pekerjaan teknisi dan konfirmasi antrean pelanggan"
                            />
                            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Terima Servisan
                            </Button>
                        </div>
                    </div>

                    {/* Placeholder 2 -> Diganti Tabs */}
                    <div className="relative overflow-hidden rounded-xl">
                        <ServiceStatusTabs
                            status={filterState.status}
                            onStatusChange={(val) => handleFilterChange('status', val)}
                        />
                    </div>

                    {/* Placeholder 3 -> Diganti Filter Bar */}
                    <div className="relative overflow-hidden rounded-xl">
                        <ServiceFilterBar
                            filterState={filterState}
                            setFilterState={setFilterState}
                            handleSearchDebounce={handleSearchDebounce}
                            onPerPageChange={(val) => handleFilterChange('per_page', val)}
                            onReset={handleResetFilters}
                        />
                    </div>
                </div>

                {/* BAGIAN BAWAH: min-h-[100vh] persis Dashboard -> Diganti Tabel */}
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border bg-card flex flex-col">
                    <ServiceTable
                        serviceOrders={serviceOrders}
                        onProcessClick={(service) => setSelectedServiceToProcess(service)}
                    />
                </div>
                
            </div>

            {/* Modals Tetap Diluar Agar Aman */}
            <ServiceFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            {selectedServiceToProcess && (
                <ServiceProcessModal
                    isOpen={!!selectedServiceToProcess}
                    onClose={() => setSelectedServiceToProcess(null)}
                    service={selectedServiceToProcess}
                />
            )}
        </>
    );
}

ServicesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Servis', href: '/services' }]}>
        {page}
    </AppLayout>
);