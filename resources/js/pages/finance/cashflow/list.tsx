import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FilterX } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { CashflowTable } from '@/components/finance/cashflow-table';
import type { CashflowPageProps } from '@/types/finance';

export default function CashflowList({ transactions, summary, filters }: CashflowPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const applyFilters = (value: string) => {
        const query: Record<string, string> = {};
        if (value) query.search = value;
        router.get('/finance/cashflow', query, { preserveState: true, replace: true });
    };

    const handleSearchDebounce = useDebouncedCallback((value: string) => {
        applyFilters(value);
    }, 400);

    const resetFilters = () => {
        setSearch('');
        applyFilters('');
    };

    return (
        <>
            <Head title="Arus Kas Harian" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Arus Kas Harian</h2>
                    <p className="text-muted-foreground">Catatan setiap transaksi yang masuk dan keluar secara mendetail.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-400">Pemasukan Hari Ini</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                                {formatCurrency(summary.income_today)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-400">Pengeluaran Hari Ini</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                                {formatCurrency(summary.expense_today)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari transaksi..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleSearchDebounce(e.target.value);
                            }}
                        />
                    </div>
                    {search && (
                        <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filter">
                            <FilterX className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Buku Kas</CardTitle>
                        <CardDescription>Detail pergerakan uang tunai maupun non-tunai terbaru.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CashflowTable transactions={transactions} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CashflowList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Keuangan' }, { title: 'Arus Kas Harian', href: '/finance/cashflow' }]}>
        {page}
    </AppLayout>
);
