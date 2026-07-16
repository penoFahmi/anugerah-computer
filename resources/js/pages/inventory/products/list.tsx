import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search, FilterX, Laptop } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { ProductTable } from '@/components/inventory/products/product-table';
import { ProductForm } from '@/components/inventory/products/product-form';
import type { ProductPageProps } from '@/types/product';

export default function ProductList({ products, filters }: ProductPageProps) {
    const [open, setOpen] = useState(false);
    const { flash } = usePage<ProductPageProps>().props;

    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        filter_status: filters.filter_status ?? 'all',
    });

    useEffect(() => {
        if (flash?.toast) toast[flash.toast.type](flash.toast.message);
    }, [flash]);

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.filter_status !== 'all') query.filter_status = newFilters.filter_status;
        router.get('/inventory/products', query, { preserveState: true, replace: true });
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
        const defaultFilters = { search: '', filter_status: 'all' };
        setFilterState(defaultFilters);
        applyFilters(defaultFilters);
    };

    const isFiltered = filterState.search || filterState.filter_status !== 'all';

    return (
        <>
            <Head title="Katalog Produk Laptop Second" />
            <div className="flex flex-col space-y-6 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading 
                        title="Katalog Laptop Second" 
                        description="Kelola etalase laptop bekas untuk dijual di toko maupun web." 
                    />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Tambah Laptop</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Input Data Laptop Bekas</DialogTitle></DialogHeader>
                            <ProductForm onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama laptop atau brand..."
                            className="pl-8"
                            value={filterState.search}
                            onChange={(e) => {
                                setFilterState((prev) => ({ ...prev, search: e.target.value }));
                                handleSearchDebounce(e.target.value);
                            }}
                        />
                    </div>
                    
                    <Select value={filterState.filter_status} onValueChange={(val) => handleFilterChange('filter_status', val)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Status Produk" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="ready">Tersedia (Ready)</SelectItem>
                            <SelectItem value="booked">Di-Booking</SelectItem>
                            <SelectItem value="sold">Terjual</SelectItem>
                        </SelectContent>
                    </Select>

                    {isFiltered && (
                        <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filter">
                            <FilterX className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <ProductTable products={products} />
                </div>
            </div>
        </>
    );
}

ProductList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Inventaris', href: '#' }, { title: 'Katalog Produk', href: '/inventory/products' }]}>
        {page}
    </AppLayout>
);