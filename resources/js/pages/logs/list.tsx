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
import { BrainCircuit, Zap, ShieldCheck } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#ff99e6', '#c984ff', '#ff6666'];

export default function LogList({ logs, filters, intentStats = [], sourceStats = [], academicMetrics }: LogsPageProps) {
    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        intent: filters.intent ?? 'all',
        status: filters.status ?? 'all',
        direction: filters.direction ?? 'all',
        per_page: filters.per_page ?? '15'
    });

    // Label Maps untuk Chart
    const intentLabelMap: Record<string, string> = {
        'setuju': 'Setuju',
        'batal': 'Batal',
        'lainnya': 'Lainnya',
    };

    const sourceLabelMap: Record<string, string> = {
        'nlp_model': 'NLP Klasifikasi',
        'llm_model': 'LLM Generatif',
        'human': 'Manusia Admin',
        'system': 'System',
        'pending': 'Menunggu Antrean',
    };

    const mappedIntentStats = intentStats.map(item => ({
        ...item,
        originalName: item.name,
        name: intentLabelMap[item.name] || item.name.replace(/_/g, ' ')
    }));

    const mappedSourceStats = sourceStats.map(item => ({
        ...item,
        originalName: item.name,
        name: sourceLabelMap[item.name] || item.name.replace(/_/g, ' ')
    }));


    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.intent && newFilters.intent !== 'all') query.intent = newFilters.intent;
        if (newFilters.status && newFilters.status !== 'all') query.status = newFilters.status;
        if (newFilters.direction && newFilters.direction !== 'all') query.direction = newFilters.direction;
        if (newFilters.per_page && newFilters.per_page !== '15') query.per_page = newFilters.per_page;

        router.get('/logs', query, { preserveState: true, replace: true });
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
        const defaultFilters = { search: '', intent: 'all', status: 'all', direction: 'all', per_page: '15' };
        setFilterState(defaultFilters);
        applyFilters(defaultFilters);
    };

    const isFiltered = filterState.search || filterState.intent !== 'all' || filterState.status !== 'all' || filterState.direction !== 'all' || filterState.per_page !== '15';

    return (
        <>
            <Head title="Log & Webhook" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Log & Webhook Sistem</h2>
                    <p className="text-muted-foreground">Pantau interaksi AI, percakapan pelanggan, dan status webhook WhatsApp.</p>
                </div>

                {/* Academic Metrics Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Akurasi NLP (FastText+SVM)</CardTitle>
                            <BrainCircuit className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{academicMetrics.avgConfidence}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Rata-rata Confidence Score
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Otonomi Sistem</CardTitle>
                            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{academicMetrics.autonomyRate}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Pesan selesai tanpa Human Handoff
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Efisiensi Token LLM</CardTitle>
                            <Zap className="w-4 h-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">~{academicMetrics.savedTokens.toLocaleString('id-ID')}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Est. token API dihemat oleh NLP
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribusi Niat</CardTitle>
                            <CardDescription>Persentase kategori pesan dari pelanggan secara keseluruhan.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] min-h-[300px]">
                            {intentStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={mappedIntentStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="name"
                                            label
                                            onClick={(data) => {
                                                if (data && data.originalName) {
                                                    handleFilterChange('intent', data.originalName);
                                                }
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {mappedIntentStats.map((entry, index) => (
                                                <Cell key={`cell-intent-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend wrapperStyle={{ cursor: 'pointer' }} onClick={(data) => {
                                            if (data && data.payload && data.payload.originalName) {
                                                handleFilterChange('intent', data.payload.originalName);
                                            }
                                        }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">Tidak ada data</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resolusi Beban Kerja</CardTitle>
                            <CardDescription>Proporsi pesan yang diselesaikan oleh NLP, LLM, atau Manusia.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] min-h-[300px]">
                            {sourceStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={mappedSourceStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="name"
                                            label
                                            onClick={(data) => {
                                                if (data && data.originalName) {
                                                    // Search by resolver via search input since there's no specific filter for source yet
                                                    handleFilterChange('search', data.originalName);
                                                }
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {mappedSourceStats.map((entry, index) => {
                                                const sourceColors: Record<string, string> = {
                                                    'NLP Klasifikasi': '#6366f1',
                                                    'LLM Generatif': '#0ea5e9',
                                                    'Manusia Admin': '#f59e0b',
                                                    'System': '#64748b',
                                                    'Menunggu Antrean': '#e2e8f0',
                                                };
                                                return <Cell key={`cell-source-${index}`} fill={sourceColors[entry.name] || COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />;
                                            })}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend wrapperStyle={{ cursor: 'pointer' }} onClick={(data) => {
                                            if (data && data.payload && data.payload.originalName) {
                                                handleFilterChange('search', data.payload.originalName);
                                            }
                                        }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">Tidak ada data</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row mt-6">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari chat atau label..."
                            className="pl-8 bg-background border-input focus-visible:ring-slate-300"
                            value={filterState.search}
                            onChange={(e) => {
                                setFilterState(prev => ({ ...prev, search: e.target.value }));
                                handleSearchDebounce(e.target.value);
                            }}
                        />
                    </div>

                    <Select value={filterState.status} onValueChange={(val) => handleFilterChange('status', val)}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-background border-input focus:ring-slate-300">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Siklus (State)</SelectItem>
                            <SelectItem value="analyzing">Menganalisa</SelectItem>
                            <SelectItem value="processed">Diproses (OK)</SelectItem>
                            <SelectItem value="handoff_triggered">Handoff (Butuh Admin)</SelectItem>
                            <SelectItem value="muted_waiting_for_admin">Mute (Tunggu Admin)</SelectItem>
                            <SelectItem value="muted_due_to_admin_activity">Mute (Admin Aktif)</SelectItem>
                            <SelectItem value="manual_reply">Balasan Admin</SelectItem>
                            <SelectItem value="notification">Notifikasi Sistem</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterState.direction} onValueChange={(val) => handleFilterChange('direction', val)}>
                        <SelectTrigger className="w-full sm:w-[150px] bg-background border-input focus:ring-slate-300">
                            <SelectValue placeholder="Arah Pesan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Arah</SelectItem>
                            <SelectItem value="inbound">Masuk (Pelanggan)</SelectItem>
                            <SelectItem value="outbound">Keluar (Sistem/Bot)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterState.intent} onValueChange={(val) => handleFilterChange('intent', val)}>
                        <SelectTrigger className="w-full sm:w-[160px] bg-background border-input focus:ring-slate-300">
                            <SelectValue placeholder="Semua Intent" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Intent</SelectItem>
                            <SelectItem value="tanya_status">Tanya Status</SelectItem>
                            <SelectItem value="batal">Batal Servis</SelectItem>
                            <SelectItem value="setuju">Setuju Servis</SelectItem>
                            <SelectItem value="lainnya">Lainnya</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterState.per_page} onValueChange={(val) => handleFilterChange('per_page', val)}>
                        <SelectTrigger className="w-full sm:w-[120px] bg-background border-input focus:ring-slate-300">
                            <SelectValue placeholder="Per Baris" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="15">15 Baris</SelectItem>
                            <SelectItem value="50">50 Baris</SelectItem>
                            <SelectItem value="100">100 Baris</SelectItem>
                            <SelectItem value="all">Semua Data</SelectItem>
                        </SelectContent>
                    </Select>

                    {isFiltered && (
                        <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filter" className="text-muted-foreground">
                            <FilterX className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <LogTable logs={logs} />
                </div>
            </div>
        </>
    );
}

LogList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Log & Webhook', href: '/logs' }]}>
        {page}
    </AppLayout>
);
