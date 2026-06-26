import { Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Printer, Pencil, Send, Trash2 } from 'lucide-react';
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
}

export function ServiceTable({ serviceOrders, onProcessClick }: ServiceTableProps) {
    // Mengambil data user yang login dari shared props Inertia untuk fitur keamanan tombol hapus
    const { auth } = usePage().props as any;
    const isAdmin = auth.user?.roles || ['administrator'].includes(auth.user?.roles);

    // Handler untuk cetak nota cerdas
    const handlePrint = (item: ServiceListItem) => {
        const isFinished = ['completed', 'taken'].includes(item.status);

        if (isFinished) {
            toast.info(`Membuka Nota Pelunasan / Kuitansi untuk ${item.order_number}`);
            window.open(`/services/${item.id}/print-receipt`, '_blank');
        } else {
            toast.info(`Membuka Nota Tanda Terima Perangkat untuk ${item.order_number}`);
            window.open(`/services/${item.id}/print-ticket`, '_blank');
        }
    };

    // Handler untuk pemicu WA Manual / Penawaran AI
    const handlePrintWaManual = (item: ServiceListItem) => {
        if (item.status === 'waiting_checking') {
            toast.success('Mengirim pengingat antrean aman ke pelanggan.');
        } else if (item.status === 'waiting_approval') {
            toast.success('Mengirim ulang rincian biaya bongkar. Sistem AI siaga.');
        } else if (item.status === 'completed') {
            toast.success('Mengirim pesan pemberitahuan laptop selesai diperbaiki.');
        }
        
        router.post(`/services/${item.id}/trigger-wa-offer`, {}, {
            preserveScroll: true,
        });
    };

    // Handler untuk hapus data (Soft Delete)
    const handleDelete = (item: ServiceListItem) => {
        if (confirm(`Apakah Anda yakin ingin membuang Nota ${item.order_number} ke tempat sampah?`)) {
            router.delete(`/services/${item.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Data berhasil dipindahkan ke tempat sampah.'),
            });
        }
    };

    // Format Rupiah sederhana
    const formatCurrency = (value: string | number | null) => {
        if (!value || Number(value) === 0) {
return '-';
}

        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(Number(value));
    };

    // Render Badge Warna Cerah sesuai kesepakatan UI
    const renderStatusBadge = (status: string, label: string) => {
        switch (status) {
            case 'waiting_checking':
                return (
                    <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100 border border-pink-300 px-2.5 py-1 text-xs font-bold rounded-md shadow-sm">
                         {label}
                    </Badge>
                );
            case 'waiting_approval':
                return (
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border border-orange-300 px-2.5 py-1 text-xs font-bold rounded-md shadow-sm">
                         {label}
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-300 px-2.5 py-1 text-xs font-bold rounded-md shadow-sm">
                         {label}
                    </Badge>
                );
            case 'completed':
            case 'taken':
                return (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-xs font-bold rounded-md shadow-sm">
                         {label}
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="px-2.5 py-1 text-xs font-bold rounded-md shadow-sm">
                        {label}
                    </Badge>
                );
        }
    };

    return (
        <TooltipProvider>
            <div className="w-full">
                {/* AREA TABEL KONVENSIONAL */}
                <div className="overflow-x-auto">
                    <Table className="w-full border-collapse">
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[50px] text-center font-bold text-slate-700">No</TableHead>
                                <TableHead className="font-bold text-slate-700">Nota & Waktu</TableHead>
                                <TableHead className="font-bold text-slate-700">Pelanggan & Kontak</TableHead>
                                <TableHead className="font-bold text-slate-700">Perangkat & Keluhan</TableHead>
                                <TableHead className="font-bold text-slate-700">Estimasi Biaya</TableHead>
                                <TableHead className="text-center font-bold text-slate-700">Status</TableHead>
                                <TableHead className="text-right font-bold text-slate-700 pr-6">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {serviceOrders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium">
                                        Tidak ada data servisan yang ditemukan pada filter ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                serviceOrders.data.map((item, index) => {
                                    // Hitung nomor urut baris berdasarkan pagination halaman aktif
                                    const rowNumber = (serviceOrders.current_page - 1) * serviceOrders.per_page + index + 1;

                                    return (
                                        <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                                            {/* Kolom 1: No */}
                                            <TableCell className="text-center font-medium text-slate-500">{rowNumber}</TableCell>
                                            
                                            {/* Kolom 2: Nota & Waktu (Vertikal) */}
                                            <TableCell className="py-3">
                                                <div className="font-bold text-blue-600 tracking-wide text-sm">{item.order_number}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">{item.created_at} WIB</div>
                                            </TableCell>
                                            
                                            {/* Kolom 3: Pelanggan & Kontak (Monospace untuk WA) */}
                                            <TableCell>
                                                <div className="font-bold text-slate-800 text-sm">{item.customer_name}</div>
                                                <a 
                                                    href={`https://wa.me/${item.customer_phone.replace(/^0/, '62')}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-block font-mono text-xs text-slate-500 hover:text-emerald-600 transition-colors mt-0.5 hover:underline"
                                                >
                                                    📱 {item.customer_phone}
                                                </a>
                                            </TableCell>
                                            
                                            {/* Kolom 4: Keluhan Perangkat (Truncate + Hover Tooltip) */}
                                            <TableCell className="max-w-[280px]">
                                                <div className="font-semibold text-slate-800 text-sm">{item.device_name}</div>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="text-xs text-slate-500 truncate mt-0.5 cursor-help max-w-full">
                                                            "{item.complaint}"
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="max-w-sm bg-slate-900 text-white p-3 rounded-lg text-xs shadow-md">
                                                        <p className="font-medium leading-relaxed">{item.complaint}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            
                                            {/* Kolom 5: Estimasi Biaya */}
                                            <TableCell className="font-medium text-slate-700 text-sm">
                                                {formatCurrency(item.estimated_cost)}
                                            </TableCell>
                                            
                                            {/* Kolom 6: Status Badge */}
                                            <TableCell className="text-center">
                                                {renderStatusBadge(item.status, item.status_label)}
                                            </TableCell>
                                            
                                            {/* Kolom 7: Deretan Tombol Eksekusi Aksi */}
                                            <TableCell className="text-right pr-6 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Tombol Cetak */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500 border-slate-200 hover:bg-slate-100" onClick={() => handlePrint(item)}>
                                                                <Printer className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">
                                                            {['completed', 'taken'].includes(item.status) ? 'Cetak Kuitansi Pelunasan' : 'Cetak Tanda Terima Perangkat'}
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {/* Tombol Edit/Proses */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100" onClick={() => onProcessClick(item)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">Ubah Status & Update Operasional</TooltipContent>
                                                    </Tooltip>

                                                    {/* Tombol WA Manual Dinamis */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon" className="h-8 w-8 text-emerald-600 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100" onClick={() => handlePrintWaManual(item)}>
                                                                <Send className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">Kirim WA Status / Picu Sistem AI</TooltipContent>
                                                    </Tooltip>

                                                    {/* Tombol Hapus (Graceful Degradation - Hanya Administrator) */}
                                                    {isAdmin && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="icon" className="h-8 w-8 text-destructive border-red-200 bg-red-50/50 hover:bg-red-100" onClick={() => handleDelete(item)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-xs">Buang ke Tempat Sampah</TooltipContent>
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

                {/* AREA NAVIGATION & PAGINATION (BAGIAN BAWAH) */}
                {serviceOrders.data.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/30 px-4 py-4 gap-4 md:px-6">
                        {/* Kiri: Teks Informasi */}
                        <div className="text-xs font-medium text-slate-500">
                            Menampilkan <span className="font-semibold text-slate-800">{serviceOrders.from}</span> sampai{' '}
                            <span className="font-semibold text-slate-800">{serviceOrders.to}</span> dari{' '}
                            <span className="font-semibold text-slate-800">{serviceOrders.total}</span> data servisan
                        </div>

                        {/* Kanan: Navigasi Tombol Angka */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {serviceOrders.links.map((link, idx) => {
                                // Menyesuaikan teks label dari server agar rapi di UI
                                let cleanLabel = link.label;

                                if (cleanLabel.includes('Previous')) {
cleanLabel = 'Sebelumnya';
}

                                if (cleanLabel.includes('Next')) {
cleanLabel = 'Selanjutnya';
}

                                return (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className={`h-8 px-3 text-xs font-semibold ${
                                            !link.url ? 'pointer-events-none opacity-40' : ''
                                        } ${
                                            link.active ? 'shadow-sm font-bold' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                                        }`}
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