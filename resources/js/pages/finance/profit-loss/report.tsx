import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfitLossTable } from '@/components/finance/profit-loss-table';
import type { ProfitLossPageProps } from '@/types/finance';

export default function ProfitLossReport({ reports, year }: ProfitLossPageProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const totalIncome = reports.reduce((acc, curr) => acc + curr.income, 0);
    const totalExpense = reports.reduce((acc, curr) => acc + curr.expense, 0);
    const totalProfit = totalIncome - totalExpense;

    return (
        <>
            <Head title="Laporan Laba Rugi" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Laporan Laba Rugi</h2>
                    <p className="text-muted-foreground">Ringkasan performa finansial per bulan pada tahun {year}.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pemasukan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(totalIncome)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengeluaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(totalExpense)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-800 dark:text-indigo-400">Total Laba Bersih</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400">
                                {formatCurrency(totalProfit)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Rincian Bulanan</CardTitle>
                        <CardDescription>Detail kalkulasi laba/rugi setiap bulan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfitLossTable reports={reports} year={year} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ProfitLossReport.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Keuangan' }, { title: 'Laporan Laba Rugi', href: '/finance/profit-loss' }]}>
        {page}
    </AppLayout>
);
