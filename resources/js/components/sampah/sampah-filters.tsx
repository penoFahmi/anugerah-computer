import { router } from '@inertiajs/react';
import { Search, FilterX } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { TrashPageProps } from '@/types/sampah';

export function TrashFilters({
    filters,
}: {
    filters: TrashPageProps['filters'];
}) {
    // Sinkronisasi state lokal dengan parameter URL saat inisialisasi
    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        type: filters.type ?? 'all',
        per_page: filters.per_page ?? '5',
    });

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};

        // Abaikan parameter default agar URL tidak kotor
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.type !== 'all') query.type = newFilters.type;
        if (newFilters.per_page !== '5') query.per_page = newFilters.per_page;

        router.get('/sampah', query, { preserveState: true, replace: true });
    };

    const handleSearchDebounce = useDebouncedCallback((value: string) => {
        applyFilters({ ...filterState, search: value });
    }, 400);

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
        applyFilters(defaultFilters);
    };

    // Deteksi apakah ada filter yang sedang aktif
    const isFiltered =
        filterState.search ||
        filterState.type !== 'all' ||
        filterState.per_page !== '5';

    return (
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
                onValueChange={(val) => handleFilterChange('per_page', val)}
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
                    <SelectItem value="customer">Pelanggan</SelectItem>
                    <SelectItem value="servis">Servis</SelectItem>
                </SelectContent>
            </Select>

            {isFiltered && (
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
    );
}
