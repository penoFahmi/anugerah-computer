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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#ff99e6', '#c984ff', '#ff6666'];


export default function LogList({ logs, filters, intentStats = [], sourceStats = [] }: LogsPageProps) {
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
                            <SelectItem value="setuju">Setuju</SelectItem>
                            <SelectItem value="batal">Batal</SelectItem>
                            <SelectItem value="lainnya">Lainnya</SelectItem>
                        </SelectContent>
                    </Select>

                    {isFiltered && (
                        <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filter">
                            <FilterX className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>

                {/* Dashboard Visuals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribusi Intent (Niat)</CardTitle>
                            <CardDescription>Persentase kategori pesan dari pelanggan secara keseluruhan.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {intentStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={intentStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="name"
                                            label
                                        >
                                            {intentStats.map((entry, index) => (
                                                <Cell key={`cell-intent-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">Tidak ada data</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resolusi AI (Beban Kerja)</CardTitle>
                            <CardDescription>Proporsi pesan yang diselesaikan oleh NLP, LLM, atau Manusia.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {sourceStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={sourceStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="name"
                                            label
                                        >
                                            {sourceStats.map((entry, index) => (
                                                <Cell key={`cell-source-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">Tidak ada data</div>
                            )}
                        </CardContent>
                    </Card>
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
