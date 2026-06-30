import { Link, usePage, router } from '@inertiajs/react';
import { Printer, Pencil, Send, Trash2, MessageSquare, FolderPen } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PaginatedServiceOrders, ServiceListItem } from '@/types/service';

interface ServiceTableProps {
    serviceOrders: PaginatedServiceOrders;
    onProcessClick: (service: ServiceListItem) => void;
    onChatClick: (service: ServiceListItem) => void;
    onDeleteClick: (service: ServiceListItem) => void;
}

export function ServiceTable({ serviceOrders, onProcessClick, onChatClick, onDeleteClick }: ServiceTableProps) {
    const { auth } = usePage().props as any;
    const isAdmin = auth.user?.roles?.includes('administrator') || auth.user?.role === 'administrator';
    const isPegawai = auth.user?.roles?.includes('pegawai');
    const isTeknisi = auth.user?.roles?.includes('teknisi');

    const handlePrint = (item: ServiceListItem) => {
        const isFinished = ['completed', 'taken'].includes(item.status);
        window.open(`/services/${item.id}/${isFinished ? 'print-receipt' : 'print-ticket'}`, '_blank');
    };

    const handlePrintWaManual = (item: ServiceListItem) => {
        toast.loading('Memicu sistem WA...');
        router.post(`/services/${item.id}/trigger-wa`, {}, { 
            preserveScroll: true,
            onSuccess: () => toast.success('Pemberitahuan berhasil dipicu ke WhatsApp.'),
        });
    };

    const formatCurrency = (value: string | number | null) => {
        if (!value || Number(value) === 0) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
    };

    const renderStatusBadge = (status: string, label: string) => {
        switch (status) {
            case 'waiting_checking': return <Badge className="bg-pink-100 text-pink-700 border-pink-300 shadow-none hover:bg-pink-100">{label}</Badge>;
            case 'waiting_approval': return <Badge className="bg-orange-100 text-orange-700 border-orange-300 shadow-none hover:bg-orange-100">{label}</Badge>;
            case 'in_progress': return <Badge className="bg-blue-100 text-blue-700 border-blue-300 shadow-none hover:bg-blue-100">{label}</Badge>;
            case 'completed':
            case 'taken': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 shadow-none hover:bg-emerald-100">{label}</Badge>;
            default: return <Badge variant="outline" className="shadow-none">{label}</Badge>;
        }
    };

    // LOGIKA PAGINATION IDENTIK DENGAN PEGAWAI
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
        return label;
    };

    return (
        <TooltipProvider>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px] text-center font-bold">No</TableHead>
                        <TableHead className="font-bold whitespace-nowrap">Nota & Waktu</TableHead>
                        <TableHead className="font-bold whitespace-nowrap">Pelanggan</TableHead>
                        <TableHead className="min-w-[200px] font-bold">Perangkat & Keluhan</TableHead>
                        <TableHead className="font-bold whitespace-nowrap">Estimasi Biaya</TableHead>
                        <TableHead className="text-center font-bold whitespace-nowrap">Status</TableHead>
                        <TableHead className="pr-4 text-right font-bold whitespace-nowrap">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {serviceOrders.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                Tidak ada data servisan yang ditemukan.
                            </TableCell>
                        </TableRow>
                    ) : (
                        serviceOrders.data.map((item, index) => {
                            const rowNumber = (serviceOrders.current_page - 1) * serviceOrders.per_page + index + 1;
                            return (
                                <TableRow key={item.id} className="transition-colors hover:bg-muted/30">
                                    <TableCell className="text-center font-medium text-muted-foreground">{rowNumber}</TableCell>
                                    <TableCell className="py-3">
                                        <div className="text-sm font-bold text-primary">{item.order_number}</div>
                                        <div className="mt-0.5 text-xs text-muted-foreground">{item.created_at}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-bold">{item.customer_name}</div>
                                        <div className="font-mono text-xs text-muted-foreground">{item.customer_phone}</div>
                                    </TableCell>
                                    <TableCell className="max-w-[280px]">
    <div className="flex items-center gap-2">
        <div className="text-sm font-semibold">{item.device_name}</div>
        {item.complaint.includes('[KLAIM GARANSI') && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-300 shadow-none px-1.5 py-0 text-[9px] hover:bg-blue-100">
                KLAIM GARANSI
            </Badge>
        )}
    </div>
    
    <Tooltip>
        <TooltipTrigger asChild>
            <div className={`mt-0.5 max-w-full truncate text-xs ${item.complaint.includes('[KLAIM GARANSI') ? 'text-blue-600 font-medium' : 'text-muted-foreground'}`}>
                {item.complaint}
            </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm p-3 text-xs shadow-md">
            <p className="leading-relaxed font-medium whitespace-pre-wrap">{item.complaint}</p>
        </TooltipContent>
    </Tooltip>
</TableCell>
                                    <TableCell className="text-sm font-medium whitespace-nowrap">{formatCurrency(item.estimated_cost)}</TableCell>
                                    <TableCell className="text-center">{renderStatusBadge(item.status, item.status_label)}</TableCell>
                                    <TableCell className="py-3 pr-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => onChatClick(item)}>
                                                        <MessageSquare className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs">Live Chat WA</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => handlePrint(item)}>
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs">Cetak Dokumen</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => onProcessClick(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs">Proses Operasional</TooltipContent>
                                            </Tooltip>

                                            {(isAdmin || isPegawai) && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-700" onClick={() => router.get(`/services/${item.id}`)}>
                                                            <FolderPen className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="text-xs">Lihat & Edit Lengkap</TooltipContent>
                                                </Tooltip>
                                            )}

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handlePrintWaManual(item)}>
                                                        <Send className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs">Kirim Update WhatsApp</TooltipContent>
                                            </Tooltip>

                                            {isAdmin && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDeleteClick(item)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="text-xs">Buang ke Sampah</TooltipContent>
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

            {/* PAGINATION PERSIS PEGAWAI TABLE */}
            {serviceOrders.data.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row">
                    <div>
                        Menampilkan {serviceOrders.from || 0} - {serviceOrders.to || 0} dari {serviceOrders.total} data servisan
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {serviceOrders.links.map((link, idx) => {
                            const relativeUrl = getRelativeUrl(link.url);
                            const labelHtml = parsePaginationLabel(link.label);

                            return (
                                <Button
                                    key={idx}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!relativeUrl}
                                    onClick={() => relativeUrl && router.get(relativeUrl, {}, { preserveState: true, preserveScroll: true })}
                                    className={`h-8 px-3 ${link.active ? 'pointer-events-none' : ''}`}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: labelHtml }} />
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
        </TooltipProvider>
    );
}