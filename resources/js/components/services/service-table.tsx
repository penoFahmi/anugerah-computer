import { router } from '@inertiajs/react';
import { Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { PaginatedServiceOrders, ServiceListItem } from '@/types/service';

interface Props {
    serviceOrders: PaginatedServiceOrders;
    onOpenDetail: (service: ServiceListItem) => void;
}

export function ServiceTable({ serviceOrders, onOpenDetail }: Props) {
    const getRelativeUrl = (absoluteUrl: string | null) => {
        if (!absoluteUrl) return null;
        try {
            const url = new URL(absoluteUrl);
            return url.pathname + url.search;
        } catch {
            return absoluteUrl;
        }
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(amount));
    };

    return (
        <div className="flex flex-col space-y-0">
            <Table>
                <TableHeader className="border-b bg-slate-50/80">
                    <TableRow>
                        <TableHead className="w-[180px]">
                            No. Nota & Waktu
                        </TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Perangkat & Keluhan</TableHead>
                        <TableHead className="text-right">
                            Estimasi Biaya
                        </TableHead>
                        <TableHead className="w-[120px] text-right">
                            Aksi
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {serviceOrders.data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="h-32 bg-slate-50/30 text-center font-medium text-muted-foreground"
                            >
                                Wadah ini kosong. Tidak ada antrean di status
                                ini.
                            </TableCell>
                        </TableRow>
                    ) : (
                        serviceOrders.data.map((item: ServiceListItem) => (
                            <TableRow
                                key={item.id}
                                className="group cursor-pointer transition-colors hover:bg-slate-50"
                                onClick={() => onOpenDetail(item)}
                            >
                                <TableCell>
                                    <div className="font-bold text-primary">
                                        {item.order_number}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.created_at}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-semibold text-slate-900">
                                        {item.customer_name}
                                    </div>
                                    <div className="font-mono text-xs text-slate-500">
                                        {item.customer_phone}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm font-semibold text-slate-800">
                                        {item.device_name}
                                    </div>
                                    <div
                                        className="max-w-[280px] truncate text-xs text-muted-foreground"
                                        title={item.complaint}
                                    >
                                        {item.complaint}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-bold text-slate-700">
                                    {Number(item.estimated_cost) > 0
                                        ? formatCurrency(item.estimated_cost)
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div
                                        className="flex items-center justify-end gap-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-slate-500 hover:text-primary"
                                            title="Cetak Nota"
                                        >
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="h-8 shadow-sm transition-all group-hover:bg-primary group-hover:text-primary-foreground"
                                            onClick={() => onOpenDetail(item)}
                                        >
                                            <Eye className="mr-1.5 h-4 w-4" />{' '}
                                            Buka
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Keamanan & Performa: Pagination Render */}
            <div className="flex flex-col items-center justify-between gap-4 border-t bg-white p-4 text-sm text-muted-foreground sm:flex-row">
                <div>
                    Menampilkan {serviceOrders.from || 0} -{' '}
                    {serviceOrders.to || 0} dari {serviceOrders.total} antrean
                </div>
                <div className="flex flex-wrap gap-1">
                    {serviceOrders.links.map((link, idx) => {
                        const relativeUrl = getRelativeUrl(link.url);
                        return (
                            <Button
                                key={idx}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!relativeUrl}
                                onClick={() =>
                                    relativeUrl &&
                                    router.get(
                                        relativeUrl,
                                        {},
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    )
                                }
                                className={`h-8 px-3 ${link.active ? 'pointer-events-none shadow-md' : 'bg-background'}`}
                            >
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: link.label.includes('Prev')
                                            ? '‹'
                                            : link.label.includes('Next')
                                              ? '›'
                                              : link.label,
                                    }}
                                />
                            </Button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
