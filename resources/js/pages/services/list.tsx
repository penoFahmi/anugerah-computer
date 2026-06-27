import { Head, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import Heading from '@/components/heading';
import { ServiceFilterBar } from '@/components/services/service-filter-bar';
import { ServiceFormModal } from '@/components/services/service-form-modal';
import { ServiceProcessModal } from '@/components/services/service-process-modal';
import { ServiceChatModal } from '@/components/services/service-chat-modal';
import { ServiceStatusTabs } from '@/components/services/service-status-tabs';
import { ServiceTable } from '@/components/services/service-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { ServiceIndexProps, ServiceListItem } from '@/types/service';

export default function ServicesIndex({ serviceOrders, filters }: ServiceIndexProps) {
    const { flash } = usePage<ServiceIndexProps>().props;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedServiceToProcess, setSelectedServiceToProcess] = useState<ServiceListItem | null>(null);
    const [selectedServiceToChat, setSelectedServiceToChat] = useState<ServiceListItem | null>(null); // <--- STATE CHAT BARU

    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        status: filters.status ?? 'all',
        per_page: filters.per_page?.toString() ?? '5',
    });

    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    // ... Handle debounce dan filter sama persis seperti kodemu sebelumnya ...
    const handleSearchDebounce = useDebouncedCallback((value: string) => {
        applyFilters({ ...filterState, search: value });
    }, 400);

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.status !== 'all') query.status = newFilters.status;
        if (newFilters.per_page !== '5') query.per_page = newFilters.per_page;

        router.get('/services', query, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleFilterChange = (key: keyof typeof filterState, value: string) => {
        const newFilters = { ...filterState, [key]: value };
        setFilterState(newFilters);
        applyFilters(newFilters);
    };

    const handleResetFilters = () => {
        setFilterState({ search: '', status: 'all', per_page: '5' });
        router.get('/services', {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Pusat Servis" />
            
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4">
                    <div className="relative overflow-hidden rounded-xl">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <Heading title="Pusat Servis" description="Manajemen pekerjaan teknisi dan Live Chat WA pelanggan." />
                            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Terima Servisan
                            </Button>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl">
                        <ServiceStatusTabs status={filterState.status} onStatusChange={(val) => handleFilterChange('status', val)} />
                    </div>

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

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border bg-card flex flex-col">
                    <ServiceTable
                        serviceOrders={serviceOrders}
                        onProcessClick={(service) => setSelectedServiceToProcess(service)}
                        onChatClick={(service) => setSelectedServiceToChat(service)} 
                    />
                </div>
            </div>

            {/* Render Modals */}
            <ServiceFormModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            
            <ServiceProcessModal 
                isOpen={!!selectedServiceToProcess} 
                onClose={() => setSelectedServiceToProcess(null)} 
                service={selectedServiceToProcess} 
            />

            {/* MODAL LIVE CHAT BARU */}
            <ServiceChatModal 
                isOpen={!!selectedServiceToChat} 
                onClose={() => setSelectedServiceToChat(null)} 
                service={selectedServiceToChat} 
            />
        </>
    );
}

ServicesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Servis', href: '/services' }]}>{page}</AppLayout>
);