import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    ArrowDownRight,
    Wrench,
    DollarSign,
    Package,
    ShoppingCart,
    Wallet,
    Sun,
    Moon,
    Sunset
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from '@/layouts/app-layout';

import { QuickActions } from '@/components/dashboard/quick-actions';
import { LowStockWidget } from '@/components/dashboard/low-stock-widget';
import { RecentServicesWidget } from '@/components/dashboard/recent-services-widget';
import { ServiceStatusChart } from '@/components/dashboard/service-status-chart';
import { FinanceTrendChart } from '@/components/dashboard/finance-trend-chart';
import { AiBusinessInsightWidget } from '@/components/dashboard/ai-business-insight-widget';

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
    recent_services?: Array<any>;
    chart_data?: any;
}

export default function Dashboard({ stats, low_stock_spareparts, recent_services = [], chart_data }: DashboardProps) {
    const user = usePage().props.auth.user;
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
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
            transition: { staggerChildren: 0.1 }
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <>
            <Head title="Dashboard" />
            <motion.div 
                className="flex flex-1 flex-col gap-6 p-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Hero Greeting Section */}
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <GreetingIcon className="h-6 w-6 text-amber-500" />
                            {greeting}, {user.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Berikut adalah ringkasan aktivitas toko Anda hari ini.
                        </p>
                    </div>
                </motion.div>

                {/* AI Insight Banner */}
                <motion.div variants={itemVariants}>
                    <AiBusinessInsightWidget />
                </motion.div>

                {/* Bagian Atas: Kartu Statistik Utama */}
                <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Kartu Pemasukan */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Pemasukan Hari Ini
                            </CardTitle>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {formatCurrency(stats?.income?.today || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                                Bulan ini: <span className="font-semibold text-emerald-600 dark:text-emerald-400 ml-1">{formatCurrency(stats?.income?.this_month || 0)}</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Kartu Pengeluaran */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Pengeluaran Hari Ini
                            </CardTitle>
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full">
                                <ArrowDownRight className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {formatCurrency(stats?.expense?.today || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <ArrowDownRight className="mr-1 h-3 w-3 text-rose-500" />
                                Bulan ini: <span className="font-semibold text-rose-600 dark:text-rose-400 ml-1">{formatCurrency(stats?.expense?.this_month || 0)}</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Kartu Servis Aktif */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Servis Berjalan
                            </CardTitle>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {stats?.active_services || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Perangkat sedang ditangani
                            </p>
                        </CardContent>
                    </Card>

                    {/* Kartu Ringkasan Laba */}
                    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border-indigo-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                Laba Bulan Ini
                            </CardTitle>
                            <div className="p-2 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-full">
                                <DollarSign className="h-5 w-5 text-indigo-700 dark:text-indigo-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-indigo-900 dark:text-indigo-100">
                                {formatCurrency((stats?.income?.this_month || 0) - (stats?.expense?.this_month || 0))}
                            </div>
                            <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 mt-1 font-medium">
                                Profit kotor bulan berjalan
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Baris 2: Quick Actions (Tombol Aksi Cepat) */}
                <motion.div variants={itemVariants}>
                    <QuickActions />
                </motion.div>

                {/* Baris 3: Kolom Konten Utama (Kiri & Kanan) */}
                <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
                    
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
