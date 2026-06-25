import { Head, router } from '@inertiajs/react';
import { Search, FilterX } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

// Import Ekstraksi Komponen UI
import { ServiceFormModal } from '@/components/services/service-form-modal';
import { ServicePageHeader } from '@/components/services/service-page-header';
import { ServiceStatusTabs } from '@/components/services/service-status-tabs';

// Import Komponen Inti (Yang akan kita buat selanjutnya)
import { ServiceTable } from '@/components/services/service-table';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { ServiceIndexProps, ServiceListItem } from '@/types/service';
import { ServiceProcessModal } from '@/components/services/service-process-modal'; 

export default function ServicesIndex({ serviceOrders, filters }: ServiceIndexProps) {
    // 1. State Modal Manajemen
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // State Modal Proses (Pengganti Sheet)
    const [selectedServiceToProcess, setSelectedServiceToProcess] = useState<ServiceListItem | null>(null);

    // 2. State Filter
    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        status: filters.status ?? 'all', 
    });

    // 3. Logika Pencarian & Filter ke Backend (Inertia)
    const applyFilters = useDebouncedCallback((newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.status && newFilters.status !== 'all') query.status = newFilters.status;

        router.get('/services', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true, // Tidak menumpuk history browser
        });
    }, 400);

    const handleSearchUpdate = (value: string) => {
        const newFilters = { ...filterState, search: value };
        setFilterState(newFilters);
        applyFilters(newFilters);
    };

    const handleStatusUpdate = (statusVal: string) => {
        const newFilters = { ...filterState, status: statusVal };
        setFilterState(newFilters);
        applyFilters.flush(); // Segera eksekusi jika tab diklik
        applyFilters(newFilters);
    };

    const handleResetSearch = () => {
        const newFilters = { ...filterState, search: '' };
        setFilterState(newFilters);
        applyFilters.flush();
        applyFilters(newFilters);
    };

    return (
        <>
            <Head title="Pusat Servis" />
            <div className="flex flex-col space-y-6 p-4 md:p-6">
                
                {/* KOMPONEN: Header Halaman */}
                <ServicePageHeader
                    title="Pusat Servis & Antrean"
                    description="Manajemen pekerjaan teknisi dan konfirmasi pelanggan."
                    onAcceptService={() => setIsCreateModalOpen(true)}
                />

                {/* KOMPONEN: Tabs Filter Status */}
                <ServiceStatusTabs 
                    status={filterState.status} 
                    onStatusChange={handleStatusUpdate} 
                />

                {/* KARTU UTAMA: Kotak Pencarian & Tabel */}
                <Card className="overflow-hidden border-slate-200 shadow-sm rounded-xl">
                    <CardHeader className="border-b bg-slate-50/50 p-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative w-full sm:max-w-md">
                                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Cari No. Nota, Nama, atau No. WA..."
                                    className="h-10 border-slate-200 bg-white pl-9 shadow-sm focus-visible:ring-primary"
                                    value={filterState.search}
                                    onChange={(e) => handleSearchUpdate(e.target.value)}
                                />
                            </div>
                            
                            {filterState.search && (
                                <Button variant="ghost" className="text-destructive hover:bg-red-50 hover:text-destructive" onClick={handleResetSearch}>
                                    <FilterX className="mr-2 h-4 w-4" /> Reset Pencarian
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* KOMPONEN: Tabel Konvensional */}
                        <ServiceTable
                            serviceOrders={serviceOrders}
                            onProcessClick={(service) => setSelectedServiceToProcess(service)}
                        />
                    </CardContent>
                </Card>

                {/* MODAL 1: Form Terima Servisan Baru */}
                <ServiceFormModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                />

                {/* MODAL 2: Modal Proses/Edit (Pengganti Sheet) */}
                <ServiceProcessModal
                    isOpen={!!selectedServiceToProcess}
                    onClose={() => setSelectedServiceToProcess(null)}
                    service={selectedServiceToProcess}
                />

            </div>
        </>
    );
}

ServicesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Manajemen Servis', href: '/services' }]}>
        {page}
    </AppLayout>
);