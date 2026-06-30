import { Link, router } from '@inertiajs/react';
import { ShieldAlert, Ban, FileText } from 'lucide-react';
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
import type { PaginatedWarranties, WarrantyListItem } from '@/types/warranty';

interface WarrantyTableProps {
    warranties: PaginatedWarranties;
    onActionClick: (warranty: WarrantyListItem, type: 'claim' | 'void') => void;
}

export function WarrantyTable({
    warranties,
    onActionClick,
}: WarrantyTableProps) {
    const getRelativeUrl = (absoluteUrl: string | null) => {
        if (!absoluteUrl) return null;
        try {
            const url = new URL(absoluteUrl);
            return url.pathname + url.search;
        } catch {
            return absoluteUrl;
        }
    };

    const parsePaginationLabel = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('prev')) return '‹ Sebelumnya';
        if (lowerLabel.includes('next')) return 'Selanjutnya ›';
        return label
            .replace(/&laquo;/g, '')
            .replace(/&raquo;/g, '')
            .trim();
    };

    const renderStatusBadge = (status: string, claimCount: number) => {
        const claimBadge =
            claimCount > 0 ? (
                <span className="ml-1 text-[9px] font-bold">
                    ({claimCount}x Klaim)
                </span>
            ) : null;

        switch (status) {
            case 'active':
                return (
                    <Badge className="border-emerald-300 bg-emerald-100 text-emerald-700 shadow-none">
                        Aktif {claimBadge}
                    </Badge>
                );
            case 'expired':
                return (
                    <Badge className="border-slate-300 bg-slate-100 text-slate-500 shadow-none">
                        Kedaluwarsa {claimBadge}
                    </Badge>
                );
            case 'void':
                return (
                    <Badge className="border-red-300 bg-red-100 text-red-700 shadow-none">
                        Hangus (Void)
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <TooltipProvider>
            <div className="flex h-full w-full flex-col">
                <div className="w-full overflow-x-auto">
                    <Table className="w-full border-collapse">
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[60px] text-center font-bold">
                                    No
                                </TableHead>
                                <TableHead className="font-bold whitespace-nowrap">
                                    Kode Garansi
                                </TableHead>
                                <TableHead className="font-bold whitespace-nowrap">
                                    Pelanggan
                                </TableHead>
                                <TableHead className="font-bold whitespace-nowrap">
                                    Perangkat
                                </TableHead>
                                <TableHead className="font-bold whitespace-nowrap">
                                    Masa Berlaku
                                </TableHead>
                                <TableHead className="text-center font-bold whitespace-nowrap">
                                    Status
                                </TableHead>
                                <TableHead className="pr-4 text-right font-bold">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {warranties.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        Tidak ada data garansi ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                warranties.data.map((item, index) => {
                                    const rowNumber =
                                        (warranties.current_page - 1) *
                                            warranties.per_page +
                                        index +
                                        1;
                                    return (
                                        <TableRow
                                            key={item.id}
                                            className="hover:bg-muted/30"
                                        >
                                            <TableCell className="text-center font-medium text-muted-foreground">
                                                {rowNumber}
                                            </TableCell>
                                            <TableCell className="py-2">
                                                <div className="text-sm font-bold text-emerald-600">
                                                    {item.warranty_code}
                                                </div>
                                                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                                                    Nota: {item.order_number}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-bold">
                                                    {item.customer_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.customer_phone}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-semibold">
                                                    {item.device_name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs font-medium">
                                                    {item.start_date}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    s/d {item.end_date}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {renderStatusBadge(
                                                    item.status,
                                                    item.claim_count,
                                                )}
                                            </TableCell>
                                            <TableCell className="pr-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* TOMBOL KLAIM (Hanya muncul jika aktif) */}
                                                    {item.status ===
                                                        'active' && (
                                                        <>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-blue-600"
                                                                        onClick={() =>
                                                                            onActionClick(
                                                                                item,
                                                                                'claim',
                                                                            )
                                                                        }
                                                                    >
                                                                        <ShieldAlert className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Klaim
                                                                    Garansi
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-red-600"
                                                                        onClick={() =>
                                                                            onActionClick(
                                                                                item,
                                                                                'void',
                                                                            )
                                                                        }
                                                                    >
                                                                        <Ban className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Hanguskan
                                                                    (Void)
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </>
                                                    )}

                                                    {/* LIHAT NOTA */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            {/* Ganti ID dengan service_order_id jika Anda bisa memparsingnya dari string, 
                                                                tapi cara paling mudah: redirect search order_number ke halaman servis */}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-500"
                                                                onClick={() =>
                                                                    router.get(
                                                                        `/services?search=${item.order_number}`,
                                                                    )
                                                                }
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Lacak ke Nota Servis
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {warranties.data.length > 0 && (
                    <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row">
                        <div>
                            Menampilkan {warranties.from || 0} -{' '}
                            {warranties.to || 0} dari {warranties.total} garansi
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {warranties.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => {
                                        const url = getRelativeUrl(link.url);
                                        if (url)
                                            router.get(
                                                url,
                                                {},
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                },
                                            );
                                    }}
                                    className={`h-8 px-3 ${link.active ? 'pointer-events-none' : ''}`}
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: parsePaginationLabel(
                                                link.label,
                                            ),
                                        }}
                                    />
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
