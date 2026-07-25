import { Link } from '@inertiajs/react';
import { Clock, Wrench } from 'lucide-react';
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
        <Card className="col-span-full lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        Servis Terbaru
                    </CardTitle>
                    <CardDescription>
                        5 antrean servis yang paling baru masuk.
                    </CardDescription>
                </div>
                <Link href="/services">
                    <Button variant="ghost" size="sm" className="text-xs">
                        Lihat Semua
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {!services || services.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                        <Wrench className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm font-medium">Belum ada data servis masuk.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {services.map((srv) => (
                            <div key={srv.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-foreground">
                                            {srv.device ? `${srv.device.brand} ${srv.device.model}` : 'Perangkat Tidak Diketahui'}
                                        </span>
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono">
                                            {srv.order_number}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        Pelanggan: <span className="font-medium text-foreground">{srv.customer?.name || 'Unknown'}</span>
                                    </span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="secondary" className="text-[10px]">
                                        {srv.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">{new Date(srv.created_at).toLocaleDateString('id-ID')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
