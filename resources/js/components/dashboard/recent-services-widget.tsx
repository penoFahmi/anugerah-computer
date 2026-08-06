import { Link } from '@inertiajs/react';
import { Clock, Wrench, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentService {
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
        brand: string;
        model: string;
    };
}

interface RecentServicesWidgetProps {
    services: RecentService[];
}

export function RecentServicesWidget({ services = [] }: RecentServicesWidgetProps) {
    return (
        <Card className="col-span-full lg:col-span-4 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40 mb-4">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Servis Terbaru
                    </CardTitle>
                    <CardDescription>
                        5 antrean servis terakhir
                    </CardDescription>
                </div>
                <Link href="/services">
                    <Button variant="ghost" size="sm" className="text-xs group">
                        Lihat Semua
                        <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {!services || services.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                            <Wrench className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium">Belum ada data servis masuk.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {services.map((srv) => (
                            <Link href={`/services?search=${srv.order_number}`} key={srv.id} className="block group">
                                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {srv.device ? `${srv.device.brand} ${srv.device.model}` : 'Perangkat Tidak Diketahui'}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono bg-white dark:bg-slate-950">
                                                {srv.order_number}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            Pelanggan: <span className="font-medium text-foreground">{srv.customer?.name || 'Unknown'}</span>
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800">
                                            {srv.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">{new Date(srv.created_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
