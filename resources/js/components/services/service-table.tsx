import { router } from '@inertiajs/react';
import {
    Settings2,
    Clock,
    Wrench,
    CheckCircle,
    XCircle,
    Printer,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    selectedId?: number | null; // Tambahan untuk Highlight baris
}

export function ServiceTable({
    serviceOrders,
    onOpenDetail,
    selectedId,
}: Props) {
    const getRelativeUrl = (absoluteUrl: string | null) => {
        if (!absoluteUrl) return null;
        try {
            const url = new URL(absoluteUrl);
            return url.pathname + url.search;
        } catch {
            return absoluteUrl;
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'waiting_checking':
            case 'waiting_approval':
                return {
                    variant: 'secondary' as const,
                    icon: Clock,
                    colorClass: 'text-amber-600 bg-amber-50',
                };
            case 'in_progress':
                return {
                    variant: 'default' as const,
                    icon: Wrench,
                    colorClass: 'text-blue-600 bg-blue-50',
                };
            case 'approved':
            case 'completed':
                return {
                    variant: 'default' as const,
                    icon: CheckCircle,
                    colorClass: 'text-emerald-600 bg-emerald-50',
                };
            case 'cancelled':
                return {
                    variant: 'destructive' as const,
                    icon: XCircle,
                    colorClass: '',
                };
            case 'taken':
                return {
                    variant: 'outline' as const,
                    icon: CheckCircle,
                    colorClass: 'text-slate-500',
                };
            default:
                return {
                    variant: 'outline' as const,
                    icon: Clock,
                    colorClass: '',
                };
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
        <div className="flex flex-col space-y-4">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead className="w-[160px]">
                                No. Nota & Waktu
                            </TableHead>
                            <TableHead>Pelanggan & Perangkat</TableHead>
                            <TableHead className="text-center">
                                Status
                            </TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {serviceOrders.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-32 text-center font-medium text-muted-foreground"
                                >
                                    Tidak ada data servis yang ditemukan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            serviceOrders.data.map((item: ServiceListItem) => {
                                const statusConfig = getStatusConfig(
                                    item.status,
                                );
                                const StatusIcon = statusConfig.icon;
                                const isSelected = item.id === selectedId; // Logika Highlight

                                return (
                                    <TableRow
                                        key={item.id}
                                        // Efek Highlight menyala biru jika diklik
                                        className={`cursor-pointer transition-colors hover:bg-slate-50/80 ${isSelected ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
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
                                                {item.customer_name}{' '}
                                                <span className="font-normal text-muted-foreground">
                                                    ({item.customer_phone})
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-700">
                                                {item.device_name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={statusConfig.variant}
                                                className={`mx-auto flex w-fit items-center justify-center gap-1.5 border-0 shadow-none ${statusConfig.colorClass}`}
                                            >
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {item.status_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div
                                                className="flex items-center justify-end gap-2"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2 text-slate-500 hover:text-primary"
                                                    title="Cetak Nota"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        isSelected
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="h-8"
                                                    onClick={() =>
                                                        onOpenDetail(item)
                                                    }
                                                >
                                                    <Settings2 className="mr-1.5 h-4 w-4" />{' '}
                                                    Kelola
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col items-center justify-between gap-4 pt-2 text-sm text-muted-foreground sm:flex-row">
                <div>
                    Menampilkan {serviceOrders.from || 0} -{' '}
                    {serviceOrders.to || 0} dari {serviceOrders.total} data
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
