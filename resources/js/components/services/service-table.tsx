import { Link, usePage, router } from '@inertiajs/react';
import {
    Printer,
    Pencil,
    Send,
    Trash2,
    MessageSquare,
    FolderPen,
} from 'lucide-react';
import { toast } from 'sonner';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PaginatedServiceOrders, ServiceListItem } from '@/types/service';

interface ServiceTableProps {
    serviceOrders: PaginatedServiceOrders;
    onProcessClick: (service: ServiceListItem) => void;
    onChatClick: (service: ServiceListItem) => void;
    onDeleteClick: (service: ServiceListItem) => void;
}

export function ServiceTable({
    serviceOrders,
    onProcessClick,
    onChatClick,
    onDeleteClick,
}: ServiceTableProps) {
    const { auth } = usePage().props as any;
    const isAdmin =
        auth.user?.roles?.includes('administrator') ||
        auth.user?.role === 'administrator';

    const handlePrint = (item: ServiceListItem) => {
        const isFinished = ['completed', 'taken'].includes(item.status);
        toast.info(`Membuka berkas cetak dokumen untuk ${item.order_number}`);
        window.open(
            `/services/${item.id}/${isFinished ? 'print-receipt' : 'print-ticket'}`,
            '_blank',
        );
    };

    const handlePrintWaManual = (item: ServiceListItem) => {
        toast.loading('Memicu sistem WA...');
        router.post(
            `/services/${item.id}/trigger-wa`,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        'Pemberitahuan manual/AI berhasil dipicu ke gateway WhatsApp.',
                    ),
            },
        );
    };

    const handleDelete = (item: ServiceListItem) => {
        if (
            confirm(
                `Apakah Anda yakin ingin membuang Nota ${item.order_number} ke tempat sampah?`,
            )
        ) {
            router.delete(`/services/${item.id}`, {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        'Data berhasil dipindahkan ke tempat sampah.',
                    ),
            });
        }
    };

    const formatCurrency = (value: string | number | null) => {
        if (!value || Number(value) === 0) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(value));
    };

    const renderStatusBadge = (status: string, label: string) => {
        switch (status) {
            case 'waiting_checking':
                return (
                    <Badge className="rounded-md border border-pink-300 bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-700 shadow-sm">
                        {label}
                    </Badge>
                );
            case 'waiting_approval':
                return (
                    <Badge className="rounded-md border border-orange-300 bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700 shadow-sm">
                        {label}
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge className="rounded-md border border-blue-300 bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 shadow-sm">
                        {label}
                    </Badge>
                );
            case 'completed':
            case 'taken':
                return (
                    <Badge className="rounded-md border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 shadow-sm">
                        {label}
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant="outline"
                        className="rounded-md px-2.5 py-0.5 text-xs font-semibold shadow-sm"
                    >
                        {label}
                    </Badge>
                );
        }
    };

    return (
        <TooltipProvider>
            <div className="flex h-full w-full flex-col">
                <div className="w-full overflow-x-auto">
                    <Table className="w-full border-collapse">
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-[60px] text-center font-bold">
                                    No
                                </TableHead>
                                <TableHead className="font-bold whitespace-nowrap">
                                    Nota & Waktu
                                </TableHead>
                                <TableHead className="font-bold whitespace-nowrap">
                                    Pelanggan
                                </TableHead>
                                <TableHead className="min-w-[200px] font-bold">
                                    Perangkat & Keluhan
                                </TableHead>
                                <TableHead className="font-bold whitespace-nowrap">
                                    Estimasi Biaya
                                </TableHead>
                                <TableHead className="text-center font-bold whitespace-nowrap">
                                    Status
                                </TableHead>
                                <TableHead className="pr-4 text-right font-bold whitespace-nowrap">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {serviceOrders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-32 text-center font-medium text-muted-foreground"
                                    >
                                        Tidak ada data servisan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                serviceOrders.data.map((item, index) => {
                                    const rowNumber =
                                        (serviceOrders.current_page - 1) *
                                            serviceOrders.per_page +
                                        index +
                                        1;
                                    return (
                                        <TableRow
                                            key={item.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <TableCell className="text-center font-medium text-muted-foreground">
                                                {rowNumber}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="text-sm font-bold tracking-wide text-primary">
                                                    {item.order_number}
                                                </div>
                                                <div className="mt-0.5 text-xs text-muted-foreground">
                                                    {item.created_at}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-bold">
                                                    {item.customer_name}
                                                </div>
                                                <div className="font-mono text-xs text-muted-foreground">
                                                    {item.customer_phone}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[280px]">
                                                <div className="text-sm font-semibold">
                                                    {item.device_name}
                                                </div>
                                                <div className="mt-0.5 max-w-full truncate text-xs text-muted-foreground">
                                                    "{item.complaint}"
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm font-medium whitespace-nowrap">
                                                {formatCurrency(
                                                    item.estimated_cost,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {renderStatusBadge(
                                                    item.status,
                                                    item.status_label,
                                                )}
                                            </TableCell>
                                            <TableCell className="py-3 pr-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* TOMBOL CHAT BARU */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-emerald-600"
                                                                onClick={() =>
                                                                    onChatClick(
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                <MessageSquare className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">
                                                            Live Chat WA
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                onClick={() =>
                                                                    handlePrint(
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                <Printer className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">
                                                            Cetak Dokumen
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                                onClick={() =>
                                                                    onProcessClick(
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">
                                                            Proses Operasional
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-700 hover:bg-slate-100"
                                                                onClick={() =>
                                                                    router.get(
                                                                        `/services/${item.id}`,
                                                                    )
                                                                }
                                                            >
                                                                <FolderPen className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">
                                                            Lihat & Edit Lengkap
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                                onClick={() =>
                                                                    handlePrintWaManual(
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                <Send className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">
                                                            Kirim Update
                                                            WhatsApp
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {isAdmin && (
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                {/* Panggil fungsi onDeleteClick dari parent, bukan confirm() lagi */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive"
                                                                    onClick={() =>
                                                                        onDeleteClick(
                                                                            item,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Hapus Nota
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* PAGINATION KEMBALI SEPERTI ASLI MILIKMU */}
                {serviceOrders.data.length > 0 && (
                    <div className="mt-auto flex w-full flex-col items-center justify-between gap-4 border-t bg-muted/20 px-4 py-4 sm:flex-row md:px-6">
                        <div className="text-center text-xs font-medium text-muted-foreground sm:text-left">
                            Menampilkan{' '}
                            <span className="font-semibold text-foreground">
                                {serviceOrders.from}
                            </span>{' '}
                            sampai{' '}
                            <span className="font-semibold text-foreground">
                                {serviceOrders.to}
                            </span>{' '}
                            dari{' '}
                            <span className="font-semibold text-foreground">
                                {serviceOrders.total}
                            </span>{' '}
                            data servisan
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                            {serviceOrders.links.map((link, idx) => {
                                let cleanLabel = link.label;
                                if (
                                    cleanLabel.includes(
                                        'pagination.previous',
                                    ) ||
                                    cleanLabel
                                        .toLowerCase()
                                        .includes('previous')
                                )
                                    cleanLabel = 'Sebelumnya';
                                else if (
                                    cleanLabel.includes('pagination.next') ||
                                    cleanLabel.toLowerCase().includes('next')
                                )
                                    cleanLabel = 'Selanjutnya';
                                cleanLabel = cleanLabel
                                    .replace(/&laquo;/g, '')
                                    .replace(/&raquo;/g, '')
                                    .trim();

                                return (
                                    <Button
                                        key={idx}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        className={`h-8 px-3 text-xs font-semibold ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                        asChild
                                    >
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                            >
                                                {cleanLabel}
                                            </Link>
                                        ) : (
                                            <span>{cleanLabel}</span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
