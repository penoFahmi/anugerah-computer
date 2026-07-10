import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search, FilterX, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { SparepartTable } from '@/components/inventory/spareparts/sparepart-table';
import { SparepartForm } from '@/components/inventory/spareparts/sparepart-form';
import type { PaginatedData, GlobalPageProps } from '@/types/global';
import type { SparePart } from '@/types/inventory';

interface Props extends GlobalPageProps {
    spareparts: PaginatedData<SparePart>;
    filters: {
        search: string | null;
        stock_status: string | null;
        per_page: string | null;
    };
}

export default function SparepartList({ spareparts, filters }: Props) {
    const [open, setOpen] = useState(false);
    const { flash } = usePage<Props>().props;

    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        stock_status: filters.stock_status ?? 'all',
        per_page: filters.per_page ?? '15',
    });

    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.stock_status !== 'all') query.stock_status = newFilters.stock_status;
        if (newFilters.per_page !== '15') query.per_page = newFilters.per_page;

        router.get('/inventory/spareparts', query, { preserveState: true, replace: true });
    };

    const handleSearchDebounce = useDebouncedCallback((value: string) => {
        applyFilters({ ...filterState, search: value });
    }, 400);

    const handleFilterChange = (key: keyof typeof filterState, value: string) => {
        const newFilters = { ...filterState, [key]: value };
        setFilterState(newFilters);
        applyFilters(newFilters);
    };

    const resetFilters = () => {
        const defaultFilters = { search: '', stock_status: 'all', per_page: '15' };
        setFilterState(defaultFilters);
        applyFilters(defaultFilters);
    };

    const isFiltered = filterState.search || filterState.stock_status !== 'all' || filterState.per_page !== '15';

    return (
        <>
            <Head title="Katalog Gudang & Sparepart" />
            <div className="flex flex-col space-y-6 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Katalog Sparepart"
                        description="Kelola daftar harga modal, harga jual, dan stok suku cadang toko."
                        icon={Package}
                    />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Barang
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Input Barang Baru</DialogTitle>
                            </DialogHeader>
                            <SparepartForm onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama barang atau SKU..."
                            className="pl-8"
                            value={filterState.search}
                            onChange={(e) => {
                                setFilterState((prev) => ({ ...prev, search: e.target.value }));
                                handleSearchDebounce(e.target.value);
                            }}
                        />
                    </div>
                    
                    <Select value={filterState.per_page} onValueChange={(val) => handleFilterChange('per_page', val)}>
                        <SelectTrigger className="w-full sm:w-[120px]">
                            <SelectValue placeholder="Baris" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="15">15 Baris</SelectItem>
                            <SelectItem value="50">50 Baris</SelectItem>
                            <SelectItem value="all">Semua</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterState.stock_status} onValueChange={(val) => handleFilterChange('stock_status', val)}>
                        <SelectTrigger className="w-full sm:w-[160px]">
                            <SelectValue placeholder="Filter Stok" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Stok</SelectItem>
                            <SelectItem value="in_stock">Tersedia (>0)</SelectItem>
                            <SelectItem value="out_of_stock">Habis (0)</SelectItem>
                            <SelectItem value="indent_only">Khusus Inden</SelectItem>
                        </SelectContent>
                    </Select>

                    {isFiltered && (
                        <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filter">
                            <FilterX className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <SparepartTable spareparts={spareparts} />
                </div>
            </div>
        </>
    );
}

SparepartList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Inventaris', href: '#' }, { title: 'Katalog Sparepart', href: '/inventory/spareparts' }]}>
        {page}
    </AppLayout>
);