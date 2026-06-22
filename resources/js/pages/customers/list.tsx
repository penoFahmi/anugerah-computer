import { Head, router, usePage } from '@inertiajs/react';
import { Search, FilterX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import { CustomerTable } from '@/components/customers/customer-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/customers';
import type { CustomersPageProps } from '@/types/customer';

export default function CustomersList({ customers, filters }: CustomersPageProps) {
    const { flash } = usePage<CustomersPageProps>().props;

    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        per_page: filters.per_page ?? '10',
    });

    useEffect(() => {
        if (flash?.toast) {
            if (flash.toast.type === 'success')
                toast.success(flash.toast.message);
            if (flash.toast.type === 'error') toast.error(flash.toast.message);
            if (flash.toast.type === 'warning')
                toast.warning(flash.toast.message);
        }
    }, [flash]);

    const handleSearchDebounce = useDebouncedCallback((value: string) => {
        applyFilters({ ...filterState, search: value });
    }, 400);

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.per_page !== '10') query.per_page = newFilters.per_page;

        router.get(index.url(), query, { preserveState: true, replace: true });
    };

    const handleFilterChange = (
        key: keyof typeof filterState,
        value: string,
    ) => {
        const newFilters = { ...filterState, [key]: value };
        setFilterState(newFilters);
        applyFilters(newFilters);
    };

    const resetFilters = () => {
        const defaultFilters = {
            search: '',
            per_page: '10',
        };
        setFilterState(defaultFilters);
        router.get(index.url(), {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Manajemen Pelanggan" />
            <div className="flex flex-col space-y-6 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Pelanggan"
                        description="Kelola informasi dan data pelanggan Anugerah Computer"
                    />
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari pelanggan..."
                            className="pl-8"
                            value={filterState.search}
                            onChange={(e) => {
                                setFilterState((prev) => ({
                                    ...prev,
                                    search: e.target.value,
                                }));
                                handleSearchDebounce(e.target.value);
                            }}
                        />
                    </div>
                    <Select
                        value={filterState.per_page}
                        onValueChange={(val) =>
                            handleFilterChange('per_page', val)
                        }
                    >
                        <SelectTrigger className="w-full sm:w-[120px]">
                            <SelectValue placeholder="Baris" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 Baris</SelectItem>
                            <SelectItem value="10">10 Baris</SelectItem>
                            <SelectItem value="20">20 Baris</SelectItem>
                            <SelectItem value="all">Semua</SelectItem>
                        </SelectContent>
                    </Select>
                    {(filterState.search ||
                        filterState.per_page !== '10') && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetFilters}
                            title="Reset Filter"
                        >
                            <FilterX className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <CustomerTable customers={customers} />
                </div>
            </div>
        </>
    );
}

CustomersList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pelanggan', href: index.url() }]}>
        {page}
    </AppLayout>
);
