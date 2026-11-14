import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    ArrowDownRight,
    Wrench,
    DollarSign,
    Wallet,
    Sun,
    Moon,
    Sunset,
    Calendar,
    Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from '@/layouts/app-layout';

import { QuickActions } from '@/components/dashboard/quick-actions';
import { ServiceStatusChart } from '@/components/dashboard/service-status-chart';
import { FinanceTrendChart, type FinancePeriod, type FinanceChartItem } from '@/components/dashboard/finance-trend-chart';
import { AiBusinessInsightWidget } from '@/components/dashboard/ai-business-insight-widget';
import { cn } from '@/lib/utils';

interface DashboardProps {
    period: FinancePeriod;
    period_label: string;
    stats: {
        income: number;
        expense: number;
        profit: number;
        active_services: number;
    };
    chart_data?: {
        finance: FinanceChartItem[];
        services: Array<{ status: string; count: number }>;
    };
}

const periodTabs: Array<{ value: FinancePeriod; label: string }> = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'year', label: 'Tahun Ini' },
];

export default function Dashboard({
    period = 'today',
    period_label = 'Hari Ini',
    stats,
    chart_data
}: DashboardProps) {
    const user = usePage().props.auth.user;
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handlePeriodChange = (newPeriod: FinancePeriod) => {
        if (newPeriod === period) return;
        router.get('/dashboard', { period: newPeriod }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Greeting logic
    const hour = new Date().getHours();
    let greeting = "Selamat Malam";
    let GreetingIcon = Moon;
    if (hour >= 5 && hour < 12) {
        greeting = "Selamat Pagi";
        GreetingIcon = Sun;
    } else if (hour >= 12 && hour < 15) {
        greeting = "Selamat Siang";
        GreetingIcon = Sun;
    } else if (hour >= 15 && hour < 18) {
        greeting = "Selamat Sore";
        GreetingIcon = Sunset;
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 25 } }
    };

    const isProfitPositive = (stats?.profit ?? 0) >= 0;

    return (
        <>
            <Head title="Dashboard" />
            <motion.div 
                className="flex flex-1 flex-col gap-6 p-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Hero Greeting Section & Filter Periode Arus Kas */}
                <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <GreetingIcon className="h-6 w-6 text-amber-500" />
                            {greeting}, {user.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Ringkasan performa finansial dan operasional toko &bull; <span className="font-medium text-slate-700 dark:text-slate-300">{period_label}</span>
                        </p>
                    </div>

                    {/* Filter Global Arus Kas */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto shadow-xs">
                        <Calendar className="w-4 h-4 ml-2 text-slate-400" />
                        {periodTabs.map((tab) => {
                            const active = period === tab.value;
                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => handlePeriodChange(tab.value)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                                        active
                                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* AI Business Insight Banner */}
                <motion.div variants={itemVariants}>
                    <AiBusinessInsightWidget />
                </motion.div>

                {/* Bagian Atas: 4 Kartu Statistik Finansial & Operasional */}
                <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Kartu Pemasukan */}
                    <Card className="hover:shadow-md transition-shadow border-slate-200/80 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Total Pemasukan
                            </CardTitle>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl">
                                <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                {formatCurrency(stats?.income || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                                Dari kasir POS & pelunasan servis
                            </p>
                        </CardContent>
                    </Card>

                    {/* Kartu Pengeluaran */}
                    <Card className="hover:shadow-md transition-shadow border-slate-200/80 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Total Pengeluaran
                            </CardTitle>
                            <div className="p-2 bg-rose-100 dark:bg-rose-950/40 rounded-xl">
                                <ArrowDownRight className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                {formatCurrency(stats?.expense || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                                Restock stok & beli unit bekas
                            </p>
                        </CardContent>
                    </Card>

                    {/* Kartu Arus Kas Bersih (Laba/Rugi) */}
                    <Card className={cn(
                        "hover:shadow-md transition-shadow border",
                        isProfitPositive
                            ? "bg-gradient-to-br from-indigo-50/60 to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20 border-indigo-100 dark:border-indigo-950/40"
                            : "bg-gradient-to-br from-rose-50/60 to-orange-50/40 dark:from-slate-900 dark:to-rose-950/20 border-rose-200 dark:border-rose-950/40"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className={cn(
                                "text-sm font-semibold",
                                isProfitPositive ? "text-indigo-950 dark:text-indigo-300" : "text-rose-950 dark:text-rose-300"
                            )}>
                                Arus Kas Bersih (Laba)
                            </CardTitle>
                            <div className={cn(
                                "p-2 rounded-xl",
                                isProfitPositive ? "bg-indigo-100 dark:bg-indigo-900/40" : "bg-rose-100 dark:bg-rose-900/40"
                            )}>
                                <Wallet className={cn(
                                    "h-4 w-4",
                                    isProfitPositive ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400"
                                )} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={cn(
                                "text-2xl font-black tracking-tight",
                                isProfitPositive ? "text-indigo-900 dark:text-indigo-200" : "text-rose-700 dark:text-rose-400"
                            )}>
                                {(stats?.profit ?? 0) > 0 ? '+' : ''}{formatCurrency(stats?.profit || 0)}
                            </div>
                            <p className={cn(
                                "text-xs mt-1 font-medium",
                                isProfitPositive ? "text-indigo-600/80 dark:text-indigo-400/80" : "text-rose-600/80 dark:text-rose-400/80"
                            )}>
                                {isProfitPositive ? "Profit operasional positif" : "Pengeluaran melebihi pemasukan"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Kartu Servis Aktif */}
                    <Card className="hover:shadow-md transition-shadow border-slate-200/80 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Servis Berjalan
                            </CardTitle>
                            <div className="p-2 bg-blue-100 dark:bg-blue-950/40 rounded-xl">
                                <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                {stats?.active_services || 0} <span className="text-sm font-normal text-muted-foreground">Unit</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Perangkat sedang dalam penanganan
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Baris 2: Quick Actions (Aksi Cepat) */}
                <motion.div variants={itemVariants}>
                    <QuickActions />
                </motion.div>

                {/* Baris 3: Kolom Konten Utama (Arus Kas & Distribusi Status Servis) */}
                <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
                    
                    {/* Kolom Kiri: Tren Arus Kas Toko (Lebar: 4) */}
                    <div className="lg:col-span-4">
                        <FinanceTrendChart
                            data={chart_data?.finance || []}
                            period={period}
                            periodLabel={period_label}
                            onPeriodChange={handlePeriodChange}
                        />
                    </div>

                    {/* Kolom Kanan: Distribusi Status Servis (Lebar: 3) */}
                    <div className="lg:col-span-3">
                        <ServiceStatusChart data={chart_data?.services || []} />
                    </div>
                    
                </motion.div>
            </motion.div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
        {page}
    </AppLayout>
);
