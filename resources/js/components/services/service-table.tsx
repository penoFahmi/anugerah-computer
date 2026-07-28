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

    const renderStatusBadge = (status: string, label: string) => {
        switch (status) {
            case 'waiting_checking':
                return (
                    <Badge className="border-pink-300 bg-pink-100 text-pink-700 shadow-none">
                        {label}
                    </Badge>
                );
            case 'waiting_approval':
                return (
                    <Badge className="border-orange-300 bg-orange-100 text-orange-700 shadow-none">
                        {label}
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge className="border-indigo-300 bg-indigo-100 text-indigo-700 shadow-none">
                        {label}
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge className="border-blue-300 bg-blue-100 text-blue-700 shadow-none">
                        {label}
                    </Badge>
                );
            case 'completed':
            case 'taken':
                return (
                    <Badge className="border-emerald-300 bg-emerald-100 text-emerald-700 shadow-none">
                        {label}
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="shadow-none">
                        {label}
                    </Badge>
                );
        }
    };

    // Fungsi pembantu untuk memunculkan badge lokasi barang HANYA di saat krusial
    const renderLocationBadge = (item: ServiceListItem) => {
        // Pastikan nilai undefined dianggap true (Di Toko) untuk mencegah data lama error
        const isAtStore = item.is_unit_left_at_store !== false; 

        // 1. KASUS BATAL: Sangat penting tahu apakah barang masih numpuk di toko atau sudah diambil
        if (item.status === 'cancelled') {
            if (isAtStore) {
                return (
                    <div className="flex items-center justify-center gap-1 mt-1.5 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">
                        <MapPin className="h-3 w-3" /> Masih di Rak Toko
                    </div>
                );
            } else {
                return (
                    <div className="flex items-center justify-center gap-1 mt-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        <Home className="h-3 w-3" /> Sudah Dikembalikan
                    </div>
                );
            }
        }

        // 2. KASUS INDEN / PENDING: Jika laptop dibawa pulang sementara oleh pelanggan
        if (!['completed', 'taken', 'cancelled'].includes(item.status) && !isAtStore) {
            return (
                <div className="flex items-center justify-center gap-1 mt-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                    <Home className="h-3 w-3" /> Dibawa Pulang Sementara
                </div>
            );
        }

        // Untuk status standar (Pasti di toko) atau Taken (Pasti sudah diambil), sembunyikan badge!
        return null;
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
                                    <TableCell className="max-w-[280px]">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-semibold">
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
                                        <div className="flex flex-col items-center justify-center">
                                            {renderStatusBadge(
                                                item.status,
                                                item.status_label,
                                            )}
                                            {renderLocationBadge(item)}
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
