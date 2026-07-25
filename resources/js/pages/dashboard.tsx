import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    ArrowDownRight,
    Wrench,
    AlertTriangle,
    DollarSign,
    Package,
    PlusCircle,
    ShoppingCart,
    Wallet,
    Clock
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from '@/layouts/app-layout';

import { QuickActions } from '@/components/dashboard/quick-actions';
import { LowStockWidget } from '@/components/dashboard/low-stock-widget';
import { RecentServicesWidget } from '@/components/dashboard/recent-services-widget';
import { ServiceStatusChart } from '@/components/dashboard/service-status-chart';
import { FinanceTrendChart } from '@/components/dashboard/finance-trend-chart';

interface DashboardProps {
    stats: {
        income: { today: number; this_month: number };
        expense: { today: number; this_month: number };
        active_services: number;
    };
    low_stock_spareparts: Array<{
        id: number;
        name: string;
        sku: string;
        stock: number;
    }>;
    recent_services?: Array<{
        id: number;
        order_number: string;
        customer_id: number;
        device_id: number;
        status: string;
        created_at: string;
        customer?: {
            id: number;
            name: string;
        };
        device?: {
            id: number;
            name: string;
        };
    }>;
    chart_data?: {
        services: Array<{ status: string; count: number }>;
        finance: Array<{ date: string; income: number; expense: number }>;
    };
}

export default function Dashboard({ stats, low_stock_spareparts, recent_services = [], chart_data }: DashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* Bagian Atas: Kartu Statistik Utama */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Kartu Pemasukan */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Pemasukan Hari Ini
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {formatCurrency(stats?.income?.today || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                                Bulan ini: <span className="font-semibold text-emerald-600 ml-1">{formatCurrency(stats?.income?.this_month || 0)}</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Kartu Pengeluaran */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Pengeluaran Hari Ini
                            </CardTitle>
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {formatCurrency(stats?.expense?.today || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                                Bulan ini: <span className="font-semibold text-red-600 ml-1">{formatCurrency(stats?.expense?.this_month || 0)}</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Kartu Servis Aktif */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Servis Berjalan
                            </CardTitle>
                            <Wrench className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {stats?.active_services || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Perangkat sedang ditangani / menunggu
                            </p>
                        </CardContent>
                    </Card>

                    {/* Kartu Ringkasan Laba */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-indigo-100 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                Laba Bulan Ini
                            </CardTitle>
                            <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-indigo-900 dark:text-indigo-100">
                                {formatCurrency((stats?.income?.this_month || 0) - (stats?.expense?.this_month || 0))}
                            </div>
                            <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 mt-1 font-medium">
                                Estimasi profit kotor bulan berjalan
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Baris 2: Quick Actions (Tombol Aksi Cepat) */}
                <QuickActions />

                {/* Baris 3: Kolom Konten Utama (Kiri & Kanan) */}
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
                    
                    {/* Kolom Kiri (Lebar: 4) */}
                    <div className="flex flex-col gap-4 lg:col-span-4">
                        <FinanceTrendChart data={chart_data?.finance || []} />
                        <RecentServicesWidget services={recent_services} />
                    </div>

                    {/* Kolom Kanan (Lebar: 3) */}
                    <div className="flex flex-col gap-4 lg:col-span-3">
                        <ServiceStatusChart data={chart_data?.services || []} />
                        <LowStockWidget items={low_stock_spareparts} />
                    </div>
                    
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
        {page}
    </AppLayout>
);
