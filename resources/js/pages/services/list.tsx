import { Head, router } from '@inertiajs/react';
import {
    Search,
    Plus,
    FilterX,
    Clock,
    Wrench,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Heading from '@/components/heading';
import { ServiceTable } from '@/components/services/service-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { ServiceDetailSheet } from '@/components/services/service-detail-sheet';

export default function ServicesIndex({ serviceOrders, filters }: any) {
    const [selectedService, setSelectedService] =
        useState<ServiceListItem | null>(null);
    // 1. State Filter Management
    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        status: filters.status ?? 'waiting_checking', // Default langsung ke antrean baru
    });

    // 2. Keamanan & Performa: Cegah Spam Request (DoS level UI)
    const applyFilters = useDebouncedCallback(
        (newFilters: typeof filterState) => {
            const query: Record<string, string> = {};
            if (newFilters.search) query.search = newFilters.search;
            if (newFilters.status !== 'all') query.status = newFilters.status;

            router.get('/services', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        400,
    );

    const handleTabChange = (statusVal: string) => {
        const newFilters = { ...filterState, status: statusVal };
        setFilterState(newFilters);
        applyFilters.flush(); // Eksekusi langsung tanpa nunggu debounce
        applyFilters(newFilters);
    };

    return (
        <>
            <Head title="Pusat Servis" />
            <div className="flex flex-col space-y-6 p-4">
                {/* --- HEADER --- */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Pusat Servis & Antrean"
                        description="Pantau pekerjaan teknisi dan konfirmasi pelanggan."
                    />
                    <Button className="bg-primary font-semibold shadow-md hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Terima Servisan
                    </Button>
                </div>

                {/* --- SISTEM WADAH (TABS PINTAR) --- */}
                {/* UX: Menggunakan visualisasi warna dan ikon agar orang awam langsung paham */}
                <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
                    <Tabs
                        value={filterState.status}
                        onValueChange={handleTabChange}
                        className="w-full"
                    >
                        <TabsList className="grid h-auto w-full grid-cols-2 bg-slate-100 p-1 md:grid-cols-4">
                            <TabsTrigger
                                value="waiting_checking"
                                className="flex flex-col gap-1 py-3 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
                            >
                                <div className="flex items-center gap-2 font-bold">
                                    <AlertCircle className="h-4 w-4" /> Antrean
                                    Baru
                                </div>
                                <span className="text-[10px] font-normal opacity-70">
                                    Belum dicek teknisi
                                </span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="waiting_approval"
                                className="flex flex-col gap-1 py-3 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900"
                            >
                                <div className="flex items-center gap-2 font-bold">
                                    <Clock className="h-4 w-4" /> Tunggu
                                    Konfirmasi
                                </div>
                                <span className="text-[10px] font-normal opacity-70">
                                    Menunggu balasan WA
                                </span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="in_progress"
                                className="flex flex-col gap-1 py-3 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
                            >
                                <div className="flex items-center gap-2 font-bold">
                                    <Wrench className="h-4 w-4" /> Dikerjakan
                                </div>
                                <span className="text-[10px] font-normal opacity-70">
                                    Deal / Sedang dieksekusi
                                </span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="completed"
                                className="flex flex-col gap-1 py-3 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
                            >
                                <div className="flex items-center gap-2 font-bold">
                                    <CheckCircle className="h-4 w-4" /> Selesai
                                </div>
                                <span className="text-[10px] font-normal opacity-70">
                                    Siap diambil & bayar
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* --- PENCARIAN & FILTER BAWAHAN --- */}
                    <div className="flex items-center gap-2 border-t pt-2">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari No. Nota, Nama, atau No. WA..."
                                className="h-10 border-slate-200 bg-slate-50 pl-9"
                                value={filterState.search}
                                onChange={(e) => {
                                    setFilterState({
                                        ...filterState,
                                        search: e.target.value,
                                    });
                                    applyFilters({
                                        ...filterState,
                                        search: e.target.value,
                                    });
                                }}
                            />
                        </div>
                        {filterState.search && (
                            <Button
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => {
                                    setFilterState({
                                        ...filterState,
                                        search: '',
                                    });
                                    applyFilters({
                                        ...filterState,
                                        search: '',
                                    });
                                }}
                            >
                                <FilterX className="mr-2 h-4 w-4" /> Reset
                            </Button>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <ServiceTable
                        serviceOrders={serviceOrders}
                        onOpenDetail={setSelectedService}
                    />
                </div>

                <ServiceDetailSheet
                    isOpen={!!selectedService}
                    onClose={() => setSelectedService(null)}
                    service={selectedService}
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
