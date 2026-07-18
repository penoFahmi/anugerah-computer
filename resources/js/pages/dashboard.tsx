import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    ArrowUpRight, 
    ArrowDownRight, 
    Wrench, 
    AlertTriangle, 
    DollarSign,
    Package
} from 'lucide-react';
import { dashboard } from '@/routes';

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
}

export default function Dashboard({ stats, low_stock_spareparts }: DashboardProps) {
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

                {/* Bagian Bawah: Widget Detail */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-2">
                    
                    {/* Daftar Stok Sparepart Menipis */}
                    <Card className="col-span-full lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Stok Sparepart Menipis
                            </CardTitle>
                            <CardDescription>
                                Barang dengan stok fisik 5 atau kurang. Segera lakukan pengadaan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!low_stock_spareparts || low_stock_spareparts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                                    <Package className="h-10 w-10 mb-2 opacity-20" />
                                    <p className="text-sm font-medium">Stok sparepart masih aman.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {low_stock_spareparts.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-foreground">{item.name}</span>
                                                <span className="text-xs text-muted-foreground font-mono">{item.sku || 'No SKU'}</span>
                                            </div>
                                            <Badge variant={item.stock === 0 ? "destructive" : "secondary"} className="font-mono px-2 py-0.5">
                                                {item.stock} Sisa
                                            </Badge>
                                        </div>
                                    ))}
                                    
                                    <div className="pt-2">
                                        <Link href="/inventory/procurement">
                                            <Button variant="outline" className="w-full text-xs">
                                                Lakukan Pengadaan Stok
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* Tempat untuk Widget masa depan (misal: Transaksi Terakhir atau Grafik) */}
                    <Card className="col-span-full lg:col-span-4 bg-muted/30 border-dashed">
                        <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-muted-foreground">
                            <p className="font-medium text-sm">Ruang Widget Tambahan</p>
                            <p className="text-xs mt-1">Dapat diisi grafik laporan bulanan nantinya.</p>
                        </div>
                    </Card>

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
