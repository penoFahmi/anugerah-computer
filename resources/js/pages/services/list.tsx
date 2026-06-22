import { Head, router } from '@inertiajs/react';
import { Search, Plus, FilterX } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Heading from '@/components/heading';
import { ServiceDetailPanel } from '@/components/services/service-detail-panel'; // PANEL BARU
import { ServiceFormModal } from '@/components/services/service-form-modal';
import { ServiceTable } from '@/components/services/service-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { ServiceIndexProps, ServiceListItem } from '@/types/service';

export default function ServicesIndex({
    serviceOrders,
    filters,
}: ServiceIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State untuk Split View (Master-Detail)
    const [selectedService, setSelectedService] =
        useState<ServiceListItem | null>(null);

    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        status: filters.status ?? 'all',
        per_page: filters.per_page?.toString() ?? '10',
    });

    const applyFilters = useDebouncedCallback(
        (newFilters: typeof filterState) => {
            const query: Record<string, string> = {};
            if (newFilters.search) query.search = newFilters.search;
            if (newFilters.status !== 'all') query.status = newFilters.status;
            if (newFilters.per_page !== '10')
                query.per_page = newFilters.per_page;

            // Reset detail panel saat melakukan pencarian/filter
            setSelectedService(null);

            router.get('/services', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        400,
    );

    const handleFilterChange = (
        key: keyof typeof filterState,
        value: string,
    ) => {
        const newFilters = { ...filterState, [key]: value };
        setFilterState(newFilters);
        if (key !== 'search') {
            applyFilters.flush();
            applyFilters(newFilters);
        } else {
            applyFilters(newFilters);
        }
    };

    const resetFilters = () => {
        const defaultFilters = { search: '', status: 'all', per_page: '10' };
        setFilterState(defaultFilters);
        setSelectedService(null);
        router.get('/services', {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Manajemen Servis" />
            <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col space-y-6 p-4">
                {/* Header & Tombol Tambah */}
                <div className="flex shrink-0 flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Antrean & Servis"
                        description="Pusat kendali operasional teknisi dan interaksi AI."
                    />
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="shadow-md"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Terima Servisan Baru
                    </Button>
                </div>

                {/* Filter & Tabs */}
                <div className="flex shrink-0 flex-col items-start justify-between gap-4 rounded-lg border bg-card p-2 shadow-sm lg:flex-row lg:items-center">
                    <Tabs
                        value={filterState.status}
                        onValueChange={(val) =>
                            handleFilterChange('status', val)
                        }
                        className="w-full lg:w-auto"
                    >
                        <TabsList className="bg-slate-100/50">
                            <TabsTrigger value="all">Semua</TabsTrigger>
                            <TabsTrigger value="waiting_checking">
                                Antrean Baru
                            </TabsTrigger>
                            <TabsTrigger value="waiting_approval">
                                Tunggu Konfirmasi
                            </TabsTrigger>
                            <TabsTrigger value="in_progress">
                                Dikerjakan
                            </TabsTrigger>
                            <TabsTrigger value="completed">Selesai</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex w-full items-center gap-2 lg:w-auto">
                        <div className="relative w-full lg:w-64">
                            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari Nota, Nama, WA..."
                                className="h-9 pl-9"
                                value={filterState.search}
                                onChange={(e) =>
                                    handleFilterChange('search', e.target.value)
                                }
                            />
                        </div>
                        <Select
                            value={filterState.per_page}
                            onValueChange={(val) =>
                                handleFilterChange('per_page', val)
                            }
                        >
                            <SelectTrigger className="h-9 w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 Baris</SelectItem>
                                <SelectItem value="20">20 Baris</SelectItem>
                                <SelectItem value="50">50 Baris</SelectItem>
                            </SelectContent>
                        </Select>
                        {(filterState.search ||
                            filterState.status !== 'all' ||
                            filterState.per_page !== '10') && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={resetFilters}
                            >
                                <FilterX className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* MASTER-DETAIL SPLIT VIEW (FLEXBOX) */}
                <div className="relative flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
                    {/* BAGIAN KIRI: Tabel (Menyusut otomatis jika selectedService ada) */}
                    <div
                        className={`h-full overflow-y-auto transition-all duration-300 ease-in-out ${selectedService ? 'hidden w-full lg:block lg:w-7/12 xl:w-2/3' : 'w-full'}`}
                    >
                        <ServiceTable
                            serviceOrders={serviceOrders}
                            onOpenDetail={setSelectedService}
                            selectedId={selectedService?.id}
                        />
                    </div>

                    {/* BAGIAN KANAN: Panel Detail */}
                    {selectedService && (
                        <div className="h-full w-full animate-in duration-300 fade-in slide-in-from-right-8 lg:w-5/12 xl:w-1/3">
                            <ServiceDetailPanel
                                service={selectedService}
                                onClose={() => setSelectedService(null)}
                            />
                        </div>
                    )}
                </div>
            </div>

            <ServiceFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}

ServicesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Manajemen Servis', href: '/services' }]}>
        {page}
    </AppLayout>
);
