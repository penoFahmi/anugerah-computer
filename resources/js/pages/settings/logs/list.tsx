import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FilterX } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { LogTable } from '@/components/settings/logs-table';
import type { LogsPageProps } from '@/types/settings';

export default function LogList({ logs, filters }: LogsPageProps) {
    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        intent: filters.intent ?? 'all'
    });

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.intent && newFilters.intent !== 'all') query.intent = newFilters.intent;
        
        router.get('/settings/logs', query, { preserveState: true, replace: true });
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
        const defaultFilters = { search: '', intent: 'all' };
        setFilterState(defaultFilters);
        applyFilters(defaultFilters);
    };

    const isFiltered = filterState.search || filterState.intent !== 'all';

    return (
        <>
            <Head title="Log & Webhook" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Log & Webhook Sistem</h2>
                    <p className="text-muted-foreground">Pantau interaksi AI, percakapan pelanggan, dan status webhook WhatsApp.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari pesan/nama/intent..."
                            className="pl-8"
                            value={filterState.search}
                            onChange={(e) => {
                                setFilterState(prev => ({ ...prev, search: e.target.value }));
                                handleSearchDebounce(e.target.value);
                            }}
                        />
                    </div>

                    <Select value={filterState.intent} onValueChange={(val) => handleFilterChange('intent', val)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Semua Intent" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Intent</SelectItem>
                            <SelectItem value="service_status">Cek Status Servis</SelectItem>
                            <SelectItem value="price_inquiry">Tanya Harga</SelectItem>
                            <SelectItem value="human_escalation">Eskalasi CS</SelectItem>
                        </SelectContent>
                    </Select>

                    {isFiltered && (
                        <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filter">
                            <FilterX className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Chat AI (Chat Log)</CardTitle>
                        <CardDescription>Rekaman percakapan bot AI (SVM & LLM) dengan pelanggan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LogTable logs={logs} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

LogList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pengaturan' }, { title: 'Log & Webhook', href: '/settings/logs' }]}>
        {page}
    </AppLayout>
);
