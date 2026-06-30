import { Head, router, usePage } from '@inertiajs/react';
import { Search, FilterX, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

import { WarrantyActionModal } from '@/components/garansi/warranty-action-modal';
import { WarrantyTable } from '@/components/garansi/warranty-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { WarrantyIndexProps, WarrantyListItem } from '@/types/warranty';

export default function WarrantiesIndex({ warranties, filters }: WarrantyIndexProps) {
    const { flash } = usePage<any>().props;

    const [selectedWarranty, setSelectedWarranty] = useState<WarrantyListItem | null>(null);
    const [actionType, setActionType] = useState<'claim' | 'void' | null>(null);

    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        status: filters.status ?? 'all',
        per_page: filters.per_page?.toString() ?? '10',
    });

    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    const handleSearchDebounce = useDebouncedCallback((value: string) => {
        applyFilters({ ...filterState, search: value });
    }, 400);

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.status !== 'all') query.status = newFilters.status;
        if (newFilters.per_page !== '10') query.per_page = newFilters.per_page;

        router.get('/garansi', query, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleFilterChange = (key: keyof typeof filterState, value: string) => {
        const newFilters = { ...filterState, [key]: value };
        setFilterState(newFilters);
        applyFilters(newFilters);
    };

    const resetFilters = () => {
        setFilterState({ search: '', status: 'all', per_page: '10' });
        router.get('/warranties', {}, { preserveState: true, replace: true });
    };

    const openModal = (warranty: WarrantyListItem, type: 'claim' | 'void') => {
        setSelectedWarranty(warranty);
        setActionType(type);
    };

    return (
        <>
            <Head title="Manajemen Garansi" />
            
            <div className="flex flex-col space-y-6 p-4 md:p-6">
                
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading 
                        title="Manajemen Garansi" 
                        description="Pusat pelacakan, klaim, dan pembatalan garansi purna jual pelanggan." 
                    />
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari Kode, Nota, WA..."
                            className="pl-8 bg-background"
                            value={filterState.search}
                            onChange={(e) => {
                                setFilterState((prev) => ({ ...prev, search: e.target.value }));
                                handleSearchDebounce(e.target.value);
                            }}
                        />
                    </div>
                    
                    <Select value={filterState.per_page} onValueChange={(val) => handleFilterChange('per_page', val)}>
                        <SelectTrigger className="w-full sm:w-[120px] bg-background">
                            <SelectValue placeholder="Baris" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 Baris</SelectItem>
                            <SelectItem value="20">20 Baris</SelectItem>
                            <SelectItem value="50">50 Baris</SelectItem>
                            <SelectItem value="all">Semua</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterState.status} onValueChange={(val) => handleFilterChange('status', val)}>
                        <SelectTrigger className="w-full sm:w-[160px] bg-background">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif (Berlaku)</SelectItem>
                            <SelectItem value="expired">Kedaluwarsa</SelectItem>
                            <SelectItem value="claimed">Sudah Diklaim</SelectItem>
                            <SelectItem value="void">Hangus (Void)</SelectItem>
                        </SelectContent>
                    </Select>

                    {(filterState.search || filterState.status !== 'all' || filterState.per_page !== '10') && (
                        <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filter">
                            <FilterX className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <WarrantyTable 
                        warranties={warranties} 
                        onActionClick={openModal} 
                    />
                </div>
            </div>

            <WarrantyActionModal 
                isOpen={!!selectedWarranty} 
                onClose={() => setSelectedWarranty(null)} 
                warranty={selectedWarranty} 
                type={actionType} 
            />
        </>
    );
}

WarrantiesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Garansi', href: '/warranties' }]}>{page}</AppLayout>
);