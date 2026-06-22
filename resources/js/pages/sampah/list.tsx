import { Head, router, usePage } from '@inertiajs/react';
import { Search, FilterX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import Heading from '@/components/heading';
import { TrashTable } from '@/components/sampah/sampah-table';
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
import type { TrashPageProps } from '@/types/sampah';

export default function TrashList({ trashItems, filters }: TrashPageProps) {
    const { flash } = usePage<TrashPageProps>().props;

    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        type: filters.type ?? 'all',
        per_page: filters.per_page ?? '5',
    });

    useEffect(() => {
        if (flash?.toast) {
            if (flash.toast.type === 'success')
                toast.success(flash.toast.message);
            if (flash.toast.type === 'error') toast.error(flash.toast.message);
        }
    }, [flash]);

    const handleSearchDebounce = useDebouncedCallback((value: string) => {
        applyFilters({ ...filterState, search: value });
    }, 400);

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.type !== 'all') query.type = newFilters.type;
        if (newFilters.per_page !== '5') query.per_page = newFilters.per_page;

        router.get('/sampah', query, { preserveState: true, replace: true });
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
        const defaultFilters = { search: '', type: 'all', per_page: '5' };
        setFilterState(defaultFilters);
        router.get('/sampah', {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Tempat Sampah" />
            <div className="flex flex-col space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Tempat Sampah"
                        description="Kelola data yang telah dihapus sementara dari sistem."
                    />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari data terhapus..."
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
                    <Select
                        value={filterState.type}
                        onValueChange={(val) => handleFilterChange('type', val)}
                    >
                        <SelectTrigger className="w-full sm:w-[160px]">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            <SelectItem value="pegawai">Pegawai</SelectItem>
                            {/* <SelectItem value="servis">Servis</SelectItem> Nanti diaktifkan */}
                        </SelectContent>
                    </Select>
                    {(filterState.search ||
                        filterState.type !== 'all' ||
                        filterState.per_page !== '5') && (
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
                    {/* Render Komponen Tabel */}
                    <TrashTable trashItems={trashItems} />
                </div>
            </div>
        </>
    );
}

TrashList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Tempat Sampah', href: '/sampah' }]}>
        {page}
    </AppLayout>
);
