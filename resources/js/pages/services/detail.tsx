import { Head, usePage } from '@inertiajs/react';
import { FileText, Settings, Wallet, Printer, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { ServiceDetailForm } from '@/components/services/service-detail-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

import type { GlobalPageProps } from '@/types/global';
import type { ServiceListItem } from '@/types/service';

interface ServiceDetailProps extends GlobalPageProps {
    serviceOrder: ServiceListItem & {
        customer: any;
        device: any;
    };
}

const STATUS_LABELS: Record<string, string> = {
    'waiting_checking': 'Menunggu Dicek',
    'waiting_approval': 'Menunggu Konfirmasi',
    'approved': 'Disetujui',
    'in_progress': 'Sedang Diperbaiki',
    'completed': 'Selesai (Siap Diambil)',
    'taken': 'Sudah Diambil (Sukses)',
    'cancelled': 'Dibatalkan',
    'returned': 'Dikembalikan (Batal)',
};

export default function ServicesDetail({ serviceOrder }: ServiceDetailProps) {
    const { flash } = usePage<ServiceDetailProps>().props;

    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    const pdfUrl = `/storage/documents/receipts/nota-${serviceOrder.order_number}.pdf`;

    const formatRupiah = (angka: number | string | null) => {
        if (!angka) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(angka));
    };

    const totalTagihan = Number(serviceOrder.final_cost || serviceOrder.estimated_cost || 0);
    const uangMuka = Number(serviceOrder.down_payment || 0);
    const sisaTagihan = totalTagihan - uangMuka;

    let statusLabel = STATUS_LABELS[serviceOrder.status] || serviceOrder.status_label || serviceOrder.status;
    const isAtStore = serviceOrder.is_unit_left_at_store === undefined ? true : Boolean(Number(serviceOrder.is_unit_left_at_store));

    if (serviceOrder.status === 'cancelled') {
        if (isAtStore) statusLabel = 'Batal (Di Toko)';
    } else if (!['completed', 'taken', 'cancelled', 'returned'].includes(serviceOrder.status) && !isAtStore) {
        statusLabel = `${statusLabel} (Inden/Dibawa Pulang)`;
    }

    return (
        <>
            <Head title={`Detail ${serviceOrder.order_number}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 items-start">
                    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm xl:col-span-2">
                        {/* Header Kolom Form Terpadu */}
                        <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/20 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Settings className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-sm font-bold text-foreground">
                                            {serviceOrder.order_number}
                                        </h2>
                                        <Badge
                                            variant="secondary"
                                            className="text-[9px] px-1.5 h-4 bg-primary/10 text-primary uppercase shadow-none border-none tracking-wider"
                                        >
                                            {statusLabel}
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Pusat kendali data pelanggan & teknisi
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Area Komponen Form */}
                        <div>
                            <ServiceDetailForm service={serviceOrder} />
                        </div>
                    </div>

                    {/* KOLOM KANAN (ERP CONTROL PANEL) */}
                    <div className="flex flex-col gap-4 xl:col-span-1 sticky top-20 pb-8">
                        
                        {/* KARTU RINGKASAN KEUANGAN */}
                        <div className="flex flex-col shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <div className="flex shrink-0 items-center gap-3 border-b border-border bg-emerald-500/10 p-4">
                                <div className="rounded-lg bg-emerald-500/20 p-2">
                                    <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-foreground">
                                        Ringkasan Keuangan
                                    </h2>
                                    <p className="text-[11px] text-muted-foreground">
                                        Rincian tagihan dan pembayaran
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                    <span className="text-xs text-muted-foreground">Total Tagihan</span>
                                    <span className="text-sm font-bold">{formatRupiah(totalTagihan)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                    <span className="text-xs text-muted-foreground">Uang Muka (DP)</span>
                                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{formatRupiah(uangMuka)}</span>
                                </div>
                                <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                                    <span className="text-xs font-bold text-muted-foreground">Sisa Tagihan</span>
                                    <span className={`text-lg font-black tracking-tight ${sisaTagihan > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        {formatRupiah(sisaTagihan)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* KARTU AKSI CEPAT */}
                        <div className="flex flex-col shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <div className="flex shrink-0 items-center gap-3 border-b border-border bg-blue-500/10 p-4">
                                <div className="rounded-lg bg-blue-500/20 p-2">
                                    <Printer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-foreground">
                                        Aksi Dokumen
                                    </h2>
                                    <p className="text-[11px] text-muted-foreground">
                                        Cetak nota atau hubungi pelanggan
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col gap-3">
                                <Button 
                                    className="w-full justify-start gap-3 h-10 shadow-sm"
                                    onClick={() => window.open(pdfUrl, '_blank')}
                                >
                                    <FileText className="h-4 w-4" />
                                    Cetak / Unduh Nota PDF
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start gap-3 h-10 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-900/20"
                                    onClick={() => window.open(`https://wa.me/${serviceOrder.customer?.phone?.replace(/^0/, '62')}`, '_blank')}
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Hubungi Via WhatsApp
                                </Button>
                            </div>
                        </div>
                        
                        {/* PENGINGAT */}
                        <div className="mt-2 p-4 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-xl">
                            <p className="text-[11px] text-orange-800 dark:text-orange-300 leading-relaxed text-justify">
                                <strong>Penting:</strong> Simpan perubahan pada formulir operasional terlebih dahulu sebelum mencetak Nota PDF agar data yang tertera pada nota sesuai dengan revisi terbaru.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ServicesDetail.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Servis', href: '/services' },
            { title: 'Detail', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
