import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search, FilterX } from 'lucide-react';
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
import type { SparepartPageProps } from '@/types/sparepart';

export default function SparepartList({ spareparts, filters }: SparepartPageProps) {
    const [open, setOpen] = useState(false);
    const { flash } = usePage<SparepartPageProps>().props;

    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        filter_stock: filters.filter_stock ?? 'all',
        filter_type: filters.filter_type ?? 'all',
        per_page: filters.per_page ?? '10',
    });

    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.filter_stock !== 'all') query.filter_stock = newFilters.filter_stock;
        if (newFilters.filter_type !== 'all') query.filter_type = newFilters.filter_type;
        if (newFilters.per_page !== '10') query.per_page = newFilters.per_page;

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
        const defaultFilters = { search: '', filter_stock: 'all', filter_type: 'all', per_page: '10' };
        setFilterState(defaultFilters);
        applyFilters(defaultFilters);
    };

    const isFiltered = filterState.search || filterState.filter_stock !== 'all' || filterState.filter_type !== 'all' || filterState.per_page !== '10';

    return (
        <>
            <Head title="Katalog Sparepart & Aksesoris" />
            <div className="flex flex-col space-y-6 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Katalog Sparepart"
                        description="Kelola data barang, harga, dan ketersediaan stok fisik gudang"
                    />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Barang
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Input Sparepart Baru</DialogTitle>
                            </DialogHeader>
                            <SparepartForm onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <div className="relative w-full sm:w-64">
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
                            <SelectItem value="10">10 Baris</SelectItem>
                            <SelectItem value="25">25 Baris</SelectItem>
                            <SelectItem value="50">50 Baris</SelectItem>
                            <SelectItem value="all">Semua</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterState.filter_stock} onValueChange={(val) => handleFilterChange('filter_stock', val)}>
                        <SelectTrigger className="w-full sm:w-[160px]">
                            <SelectValue placeholder="Status Stok" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Stok</SelectItem>
                            <SelectItem value="available">Tersedia (&gt; 0)</SelectItem>
                            <SelectItem value="empty">Habis (0)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterState.filter_type} onValueChange={(val) => handleFilterChange('filter_type', val)}>
                        <SelectTrigger className="w-full sm:w-[170px]">
                            <SelectValue placeholder="Sifat Barang" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Sifat</SelectItem>
                            <SelectItem value="ready">Ready Stock</SelectItem>
                            <SelectItem value="indent">Pre-Order (Inden)</SelectItem>
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
    <AppLayout breadcrumbs={[{ title: 'Inventaris', href: '#' }, { title: 'Stok Sparepart', href: '/inventory/spareparts' }]}>
        {page}
    </AppLayout>
);