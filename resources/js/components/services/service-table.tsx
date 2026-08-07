import { router, usePage, Link } from '@inertiajs/react';
import {
    Printer,
    Pencil,
    Send,
    Trash2,
    MessageSquare,
    FolderPen,
    MapPin,
    Home,
    MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { PaginatedData } from '@/types/global';
import type { ServiceListItem } from '@/types/service';

interface ServiceTableProps {
    serviceOrders: PaginatedData<ServiceListItem>;
    onProcessClick: (service: ServiceListItem) => void;
    onChatClick: (service: ServiceListItem) => void;
    onDeleteClick: (service: ServiceListItem) => void;
    unreadChatPhones: string[];
}

export function ServiceTable({
    serviceOrders,
    onProcessClick,
    onChatClick,
    onDeleteClick,
    unreadChatPhones,
}: ServiceTableProps) {
    const { auth } = usePage().props as any;
    const isAdmin =
        auth.user?.roles?.includes('administrator') ||
        auth.user?.role === 'administrator';
    const isPegawai = auth.user?.roles?.includes('pegawai');

    const handlePrint = (item: ServiceListItem) => {
        const isFinished = ['completed', 'taken'].includes(item.status);
        window.open(
            `/services/${item.id}/${isFinished ? 'print-receipt' : 'print-ticket'}`,
            '_blank',
        );
    };

    const handlePrintWaManual = (item: ServiceListItem) => {
        const toastId = toast.loading('Memicu sistem WA...');
        router.post(
            `/services/${item.id}/trigger-wa`,
            {},
            {
                preserveScroll: true,
                onFinish: () => toast.dismiss(toastId),
            },
        );
    };

    const formatCurrency = (value: string | number | null) => {
        if (!value || Number(value) === 0) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(value));
    };

    const renderStatusBadge = (item: ServiceListItem) => {
        const { status, status_label } = item;

        const renderBadge = (classes: string) => (
            <Badge className={`${classes} shadow-none flex items-center justify-center whitespace-nowrap`}>
                {status_label}
            </Badge>
        );

        switch (status) {
            case 'waiting_checking':
                return renderBadge("border-pink-300 bg-pink-100 text-pink-700");
            case 'waiting_approval':
                return renderBadge("border-orange-300 bg-orange-100 text-orange-700");
            case 'approved':
                return renderBadge("border-indigo-300 bg-indigo-100 text-indigo-700");
            case 'in_progress':
                return renderBadge("border-blue-300 bg-blue-100 text-blue-700");
            case 'completed':
                return renderBadge("border-emerald-300 bg-emerald-100 text-emerald-700");
            case 'taken':
                return renderBadge("border-teal-300 bg-teal-100 text-teal-700");
            case 'returned':
                return renderBadge("border-rose-300 bg-rose-100 text-rose-700");
            case 'cancelled':
                return renderBadge("border-red-300 bg-red-100 text-red-700");
            default:
                return renderBadge("border-slate-300 bg-slate-100 text-slate-700");
        }
    };



    return (
        <TooltipProvider>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[60px] text-center font-bold">
                            No
                        </TableHead>
                        <TableHead className="font-bold whitespace-nowrap">
                            Nota
                        </TableHead>
                        <TableHead className="font-bold whitespace-nowrap">
                            Pelanggan
                        </TableHead>
                        <TableHead className="min-w-[200px] font-bold">
                            Perangkat
                        </TableHead>
                        <TableHead className="font-bold whitespace-nowrap">
                            Tagihan
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
                                className="py-8 text-center text-muted-foreground"
                            >
                                Tidak ada data servisan yang ditemukan.
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
                                        <div className="text-sm font-bold text-primary">
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
                                    <TableCell className="max-w-[280px] py-3">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-semibold text-foreground">
                                                    {item.device_name}
                                                </div>
                                                {item.complaint.includes(
                                                    '[KLAIM GARANSI',
                                                ) && (
                                                    <Badge className="border-blue-300 bg-blue-100 px-1.5 py-0 text-[9px] text-blue-700 shadow-none">
                                                        KLAIM GARANSI
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`mt-0.5 max-w-full cursor-help truncate text-xs ${item.complaint.includes('[KLAIM GARANSI') ? 'font-medium text-blue-600' : 'text-muted-foreground'}`}
                                                >
                                                    {item.complaint}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="bottom"
                                                className="max-w-sm p-3 text-xs shadow-md"
                                            >
                                                <p className="leading-relaxed font-medium whitespace-pre-wrap">
                                                    {item.complaint}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>

                                        {/* INDIKATOR LOKASI UNIT: Hanya tampil jika dibawa pulang (Exception) */}
                                        {!['completed', 'taken', 'cancelled', 'returned'].includes(item.status) && (item.is_unit_left_at_store == false || item.is_unit_left_at_store == 0 || item.is_unit_left_at_store === '0') && (
                                            <div className="flex items-center gap-1 text-[10.5px] text-orange-600 dark:text-orange-400 font-bold mt-1">
                                                Dibawa Pulang
                                            </div>
                                        )}

                                    </TableCell>
                                    <TableCell className="py-3 align-top min-w-[200px]">
                                        <div className="flex flex-col gap-1.5 text-[11px] px-1">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-muted-foreground">
                                                    Estimasi:
                                                </span>
                                                <span className="font-mono text-foreground">
                                                    {formatCurrency(
                                                        item.financials
                                                            ?.estimated,
                                                    )}
                                                </span>
                                            </div>

                                            {Number(item.financials?.final) >
                                                0 && (
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-muted-foreground">
                                                        Biaya Akhir:
                                                    </span>
                                                    <span className="font-mono font-semibold text-foreground">
                                                        {formatCurrency(
                                                            item.financials
                                                                ?.final,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            {Number(item.financials?.dp) > 0 && (
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-muted-foreground">
                                                        Uang Muka:
                                                    </span>
                                                    <span className="font-mono text-emerald-600 dark:text-emerald-500">
                                                        -{' '}
                                                        {formatCurrency(
                                                            item.financials?.dp,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="mt-1 flex items-center justify-between gap-4 border-t border-border/50 pt-1.5">
                                                <span className="font-bold text-foreground">
                                                    Sisa:
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {item.financials?.is_paid && (
                                                        <span className="px-1.5 rounded-sm bg-emerald-500 text-white text-[9px] font-black tracking-wider">
                                                            LUNAS
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`font-mono font-bold ${item.financials?.remaining > 0 ? 'text-orange-600 dark:text-orange-500' : 'text-emerald-600 dark:text-emerald-500'}`}
                                                    >
                                                        {formatCurrency(
                                                            item.financials
                                                                ?.remaining,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center align-middle">
                                        <div className="flex flex-col items-center justify-center gap-1.5 w-[140px] mx-auto">
                                            {renderStatusBadge(item)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 pr-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="relative h-8 w-8 text-emerald-600"
                                                        onClick={() =>
                                                            onChatClick(item)
                                                        }
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                        {unreadChatPhones.includes(
                                                            item.customer_phone,
                                                        ) && (
                                                            <span className="absolute top-1 right-1 h-2 w-2 animate-pulse rounded-full border border-background bg-red-500" />
                                                        )}
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
                                                        className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                                        onClick={() => onProcessClick(item)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs">Proses Operasional</TooltipContent>
                                            </Tooltip>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handlePrint(item)}>
                                                        <Printer className="mr-2 h-4 w-4 text-slate-500" />
                                                        Cetak Dokumen
                                                    </DropdownMenuItem>
                                                    
                                                    {(isAdmin || isPegawai) && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/services/${item.id}`} className="flex cursor-pointer items-center w-full">
                                                                <FolderPen className="mr-2 h-4 w-4 text-slate-500" />
                                                                Lihat/Edit Lengkap
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem onClick={() => handlePrintWaManual(item)}>
                                                        <Send className="mr-2 h-4 w-4 text-emerald-600" />
                                                        Kirim Update WA
                                                    </DropdownMenuItem>

                                                    {isAdmin && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => onDeleteClick(item)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Buang ke Sampah
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            {/* MEMANGGIL PAGINATION GLOBAL */}
            <Pagination
                links={serviceOrders.links}
                from={serviceOrders.from}
                to={serviceOrders.to}
                total={serviceOrders.total}
            />
        </TooltipProvider>
    );
}
