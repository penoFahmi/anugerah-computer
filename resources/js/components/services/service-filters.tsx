import { router } from '@inertiajs/react';
import { Search, FilterX } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ServiceIndexProps } from '@/types/service';
import { ServiceStatusTabs } from './service-status-tabs';

export function ServiceFilters({ filters }: { filters: ServiceIndexProps['filters'] }) {
    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        status: filters.status ?? 'all',
        per_page: filters.per_page?.toString() ?? '10',
    });

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.status !== 'all') query.status = newFilters.status;
        if (newFilters.per_page !== '10') query.per_page = newFilters.per_page;

        router.get('/services', query, { preserveState: true, replace: true });
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
        const defaultFilters = { search: '', status: 'all', per_page: '10' };
        setFilterState(defaultFilters);
        applyFilters(defaultFilters);
    };

    const isFiltered = filterState.search || filterState.status !== 'all' || filterState.per_page !== '10';

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* TABS STATUS */}
            <ServiceStatusTabs
                status={filterState.status}
                onStatusChange={(val) => handleFilterChange('status', val)}
            />

            {/* INPUT PENCARIAN & PAGINATION */}
            <div className="flex flex-col items-center gap-3 sm:flex-row">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nota, nama, WA..."
                        className="bg-background pl-8"
                        value={filterState.search}
                        onChange={(e) => {
                            setFilterState((prev) => ({ ...prev, search: e.target.value }));
                            handleSearchDebounce(e.target.value);
                        }}
                    />
                </div>

                <Select value={filterState.per_page} onValueChange={(val) => handleFilterChange('per_page', val)}>
                    <SelectTrigger className="w-full bg-background sm:w-[120px]">
                        <SelectValue placeholder="Baris" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 Baris</SelectItem>
                        <SelectItem value="10">10 Baris</SelectItem>
                        <SelectItem value="20">20 Baris</SelectItem>
                        <SelectItem value="all">Semua</SelectItem>
                    </SelectContent>
                </Select>

                {isFiltered && (
                    <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filter">
                        <FilterX className="h-4 w-4 text-muted-foreground" />
                    </Button>
                )}
            </div>
        </div>
    );
}