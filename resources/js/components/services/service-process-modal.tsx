import { useForm, router } from '@inertiajs/react';
import { Loader2, Clock, Wrench, FileText, Send, Check, Play, CheckCircle2, XCircle, HandCoins, ShieldCheck, Save, Plus, Banknote, CreditCard, QrCode, Sparkles, Wand2, List, MapPin, Home, Trash2, X, CheckCircle, FileDown, AlertTriangle, MoreVertical, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { Alert as UIAlert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type { ServiceListItem } from '@/types/service';

interface ServiceProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceListItem & { final_cost?: string | number | null, down_payment?: string | number | null } | null;
    available_spare_parts?: any[];
}

export function ServiceProcessModal({ isOpen, onClose, service, available_spare_parts }: ServiceProcessModalProps) {
    const { data, setData, processing, clearErrors } = useForm({
        estimated_cost: '',
        final_cost: '',
        down_payment: '',
        technician_notes: '',
        warranty_days: '30',
        is_full_update: false,
        payment_method: 'cash',
    });

    const [alertConfig, setAlertConfig] = useState<{ open: boolean; action: string; title: string; desc: string; isWa?: boolean }>({
        open: false, action: '', title: '', desc: '', isWa: false,
    });

    // State untuk input sparepart
    const [selectedSparepart, setSelectedSparepart] = useState<string>('');
    const [sparepartSearchQuery, setSparepartSearchQuery] = useState('');
    const [isSparepartDropdownOpen, setIsSparepartDropdownOpen] = useState(false);
    const [sparepartQty, setSparepartQty] = useState<number>(1);
    const [fetchedSpareparts, setFetchedSpareparts] = useState<any[]>([]);

    const sparepartDropdownRef = useRef<HTMLDivElement>(null);

    // Fetch spareparts from API async
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (sparepartSearchQuery && !selectedSparepart) {
                axios.get(`/api/spare-parts/search?q=${sparepartSearchQuery}`).then((res) => {
                    setFetchedSpareparts(res.data);
                });
            } else if (!sparepartSearchQuery) {
                setFetchedSpareparts([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [sparepartSearchQuery, selectedSparepart]);

    // Handle klik di luar dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sparepartDropdownRef.current && !sparepartDropdownRef.current.contains(event.target as Node)) {
                setIsSparepartDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && service) {
            // Karena final_cost/estimated_cost sudah mencakup harga sparepart (borongan), 
            // kita tidak perlu lagi menambahkan sum sparepart ke dalamnya.
            const initialFinalCost = service.final_cost !== null
                ? Number(service.final_cost)
                : (service.estimated_cost ? Number(service.estimated_cost) : 0);

            setData({
                estimated_cost: service.estimated_cost ? Math.round(Number(service.estimated_cost)).toString() : '',
                final_cost: initialFinalCost ? Math.round(initialFinalCost).toString() : '',
                down_payment: service.down_payment ? Math.round(Number(service.down_payment)).toString() : '',
                technician_notes: service.technician_notes || '',
                warranty_days: '30',
                is_full_update: false,
                payment_method: 'cash',
            });
            clearErrors();
            setSelectedSparepart('');
            setSparepartQty(1);
        }
    }, [isOpen, service?.id]);

    if (!service) return null;

    const processAction = (targetStatus: string, isTriggerWa: boolean = false) => {
        // Reset state input sparepart
        setSelectedSparepart('');
        setSparepartSearchQuery('');
        setSparepartQty(1);

        const isWarranty = service?.complaint?.startsWith('KLAIM GARANSI');

        const payload = {
            status: targetStatus,
            estimated_cost: data.estimated_cost ? Number(data.estimated_cost) : null,
            final_cost: data.final_cost ? Number(data.final_cost) : null,
            down_payment: data.down_payment ? Number(data.down_payment) : 0,
            technician_notes: data.technician_notes,
            warranty_days: data.warranty_days ? Number(data.warranty_days) : 0,
            payment_method: data.payment_method || 'cash',
            is_full_update: false,
            send_wa: isTriggerWa,
        };

        const toastId = isTriggerWa ? toast.loading('Menyimpan data dan mengirim pesan WhatsApp...') : toast.loading('Menyimpan data...');

        router.put(`/services/${service.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.dismiss(toastId);
                onClose();
            },
            onError: () => { toast.dismiss(toastId); }
        });
    };

    const handleConfirmAlert = () => {
        if (alertConfig.action) processAction(alertConfig.action, alertConfig.isWa);
        setAlertConfig({ ...alertConfig, open: false });
    };

    const formatRupiah = (angka: string | number | null | undefined) => {
        if (!angka) return '0';
        return new Intl.NumberFormat('id-ID').format(Number(angka));
    };

    const renderFormContent = () => {
        const status = service.status;
        const isWarranty = service?.complaint?.startsWith('KLAIM GARANSI');

        const warningBawaPulang = !service.is_unit_left_at_store && status !== 'taken' && status !== 'returned' && (
            <UIAlert className="bg-orange-500/10 border-orange-500/30 mb-4">
                <AlertDescription className="text-orange-700 dark:text-orange-400 text-xs font-bold flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Unit tidak ada di toko (Dibawa Pulang Pelanggan).
                </AlertDescription>
            </UIAlert>
        );

        if (status === 'waiting_checking') {
            return (
                <div className="flex flex-col h-full space-y-4">
                    {warningBawaPulang}
                    <UIAlert className="bg-muted/50 border-border py-2.5">
                        <AlertDescription className="text-muted-foreground text-xs leading-relaxed font-medium">
                            Lakukan pengecekan awal pada perangkat. Masukkan estimasi biaya di bawah, lalu klik "Kirim Penawaran WA". Jika unit tidak dapat diperbaiki, Anda bisa membatalkannya.
                        </AlertDescription>
                    </UIAlert>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Estimasi Biaya Pengecekan (Rp)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">Rp</span>
                            <Input
                                type="text"
                                className="pl-9 bg-background font-mono"
                                value={data.estimated_cost ? formatRupiah(data.estimated_cost) : ''}
                                onChange={(e) => {
                                    const clean = e.target.value.replace(/\D/g, '');
                                    setData('estimated_cost', clean);
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Catatan Pengecekan
                            </Label>

                        </div>
                        <Textarea className="flex-1 text-sm resize-none bg-background p-3 custom-scrollbar min-h-[80px]" placeholder="Misal: Sparepart kosong, IC Power mati..." value={data.technician_notes} onChange={(e) => setData('technician_notes', e.target.value)} />
                    </div>
                </div>
            );
        }

        if (status === 'waiting_approval' || status === 'approved') {
            return (
                <div className="flex flex-col h-full space-y-4">
                    {warningBawaPulang}
                    <UIAlert className={`py-2.5 ${status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
                        <AlertDescription className={`text-xs leading-relaxed font-medium ${status === 'approved' ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}`}>
                            {status === 'approved' ? '✓ Pelanggan telah MENYETUJUI biaya. Silakan "Mulai Kerjakan".' : '⏳ Menunggu konfirmasi. Anda dapat memulainya jika pelanggan sudah setuju secara lisan.'}
                        </AlertDescription>
                    </UIAlert>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Estimasi Biaya Kesepakatan</Label>
                        <Input disabled className="bg-muted font-bold font-mono text-foreground" value={`Rp ${formatRupiah(data.estimated_cost)}`} />
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Catatan Teknisi
                            </Label>

                        </div>
                        <Textarea className="flex-1 text-sm resize-none bg-background p-3 custom-scrollbar min-h-[80px]" value={data.technician_notes} onChange={(e) => setData('technician_notes', e.target.value)} />
                    </div>
                </div>
            );
        }

        if (status === 'in_progress') {
            const handleAddSparepart = () => {
                if (!selectedSparepart || !service) return;
                router.post(`/services/${service.id}/spareparts`, {
                    spare_part_id: selectedSparepart,
                    quantity: sparepartQty
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setSelectedSparepart('');
                        setSparepartQty(1);
                        toast.success('Sparepart ditambahkan');
                    }
                });
            };

            const handleRemoveSparepart = (pivotId: number) => {
                router.delete(`/services/${service.id}/spareparts/${pivotId}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => toast.success('Sparepart dihapus')
                });
            };

            return (
                <div className="flex flex-col h-full space-y-4">
                    {warningBawaPulang}
                    <div className="p-4 border border-border rounded-xl bg-muted/40 space-y-4 shrink-0 overflow-visible">
                        <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                            Gunakan Sparepart / Jasa Tambahan
                        </Label>
                        <div className="flex flex-col sm:flex-row gap-2.5 relative z-50">
                            <div className="flex-1 w-full relative" ref={sparepartDropdownRef}>
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9 pr-9 h-[38px] bg-background font-semibold"
                                        placeholder="Cari sparepart..."
                                        value={sparepartSearchQuery}
                                        onChange={(e) => {
                                            setSparepartSearchQuery(e.target.value);
                                            setIsSparepartDropdownOpen(true);
                                            setSelectedSparepart('');
                                        }}
                                        onFocus={() => setIsSparepartDropdownOpen(true)}
                                    />
                                    {sparepartSearchQuery && (
                                        <button
                                            type="button"
                                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-red-500 transition-colors"
                                            onClick={() => {
                                                setSelectedSparepart('');
                                                setSparepartSearchQuery('');
                                                setIsSparepartDropdownOpen(true);
                                            }}
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {isSparepartDropdownOpen && (
                                    <div className="absolute z-50 mt-1.5 w-full max-h-[250px] overflow-y-auto custom-scrollbar rounded-md border bg-popover shadow-lg">
                                        {fetchedSpareparts.length > 0 ? (
                                            fetchedSpareparts
                                                .map(sp => {
                                                    const isOutOfStock = !sp.is_always_indent && sp.stock <= 0;
                                                    return (
                                                        <button
                                                            key={sp.id}
                                                            type="button"
                                                            disabled={isOutOfStock}
                                                            className={cn(
                                                                "w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted focus:bg-muted border-b border-border/50 last:border-0",
                                                                isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                            )}
                                                            onClick={() => {
                                                                setSelectedSparepart(String(sp.id));
                                                                setSparepartSearchQuery(sp.name);
                                                                setIsSparepartDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span className="font-medium text-foreground">{sp.name}</span>
                                                            <span className="text-xs ml-2 opacity-70">
                                                                {isOutOfStock ? '(Stok Habis)' : `(Stok: ${sp.stock})`}
                                                            </span>
                                                        </button>
                                                    )
                                                })
                                        ) : (
                                            <div className="p-3 text-center text-sm text-muted-foreground">Data tidak ditemukan.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number" min="1"
                                    className="w-16 h-[38px] px-2 text-center font-bold border-input focus-visible:ring-blue-500"
                                    value={sparepartQty}
                                    onChange={(e) => setSparepartQty(Number(e.target.value))}
                                    title="Kuantitas"
                                />
                                <Button type="button" size="sm" onClick={handleAddSparepart} disabled={!selectedSparepart || processing} className="h-[38px] px-4 shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold">
                                    <Plus className="h-4 w-4 mr-1.5" /> Tambah
                                </Button>
                            </div>
                        </div>
                        {service.spare_parts && service.spare_parts.length > 0 && (
                            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1 mt-3">
                                {service.spare_parts.map((sp: any) => (
                                    <div key={sp.id} className="text-xs flex justify-between items-center bg-background px-3 py-2.5 rounded-lg border border-border/80 shadow-sm transition-colors hover:bg-muted/50">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="px-1.5 h-5 min-w-[20px] justify-center">{sp.quantity}x</Badge>
                                            <span className="font-semibold text-foreground">{sp.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleRemoveSparepart(sp.pivot_id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Estimasi Awal</Label>
                            <Input disabled className="bg-muted text-foreground font-mono" value={`Rp ${formatRupiah(data.estimated_cost)}`} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-blue-700 dark:text-blue-400">Biaya Akhir (Final Cost)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-xs font-bold text-blue-700/50 dark:text-blue-400/50">Rp</span>
                                <Input
                                    type="text"
                                    className="pl-9 border-blue-300 focus-visible:ring-blue-500 font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 font-mono"
                                    value={data.final_cost ? formatRupiah(Number(data.final_cost)) : ''}
                                    onChange={(e) => {
                                        const clean = e.target.value.replace(/\D/g, '');
                                        setData('final_cost', clean);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Tindakan yang Dilakukan
                            </Label>

                        </div>
                        <Textarea placeholder="Sparepart yang diganti..." className="flex-1 text-sm resize-none bg-background p-3 custom-scrollbar min-h-[80px]" value={data.technician_notes} onChange={(e) => setData('technician_notes', e.target.value)} />
                    </div>
                </div>
            );
        }

        if (status === 'completed') {
            const dp = Number(data.down_payment || 0);
            const finalCost = Number(data.final_cost || data.estimated_cost || 0);
            const remaining = finalCost - dp;
            const isOverpaid = remaining < 0;

            return (
                <div className="flex flex-col h-full space-y-4">
                    {warningBawaPulang}
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-5 text-slate-100 shadow-xl border border-slate-800 shrink-0 relative overflow-hidden">
                        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-emerald-500/50" />

                        <div className="flex justify-between items-center mb-4 border-b border-slate-700/80 pb-4">
                            <span className="text-xs text-slate-400 font-medium tracking-wide uppercase flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Biaya Akhir (Final)
                            </span>
                            <span className="text-base font-mono font-bold text-white">Rp {formatRupiah(finalCost)}</span>
                        </div>

                        <div className="flex justify-between items-center mb-4 border-b border-slate-700/80 pb-4">
                            <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Uang Muka / Dibayar</span>
                            <div className="relative w-36">
                                <span className="absolute left-3 top-2.5 text-[11px] font-bold text-slate-500">Rp</span>
                                <Input
                                    type="text"
                                    className="pl-8 h-9 text-sm bg-slate-950 border-slate-700 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-emerald-400 font-mono font-bold text-right shadow-inner"
                                    value={data.down_payment ? formatRupiah(Number(data.down_payment)) : ''}
                                    onChange={(e) => {
                                        const clean = e.target.value.replace(/\D/g, '');
                                        setData('down_payment', clean);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 mb-6 bg-slate-950/50 -mx-5 px-5 py-3 border-y border-slate-800/50">
                            <span className="text-sm font-bold text-white tracking-widest uppercase">
                                {isOverpaid ? 'Uang Kembali' : (remaining === 0 ? 'Status Pembayaran' : 'Sisa Tagihan')}
                            </span>
                            <span className={`text-2xl font-black font-mono tracking-tight ${isOverpaid ? 'text-blue-400' : remaining > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                {remaining === 0 && !isOverpaid ? 'LUNAS' : `Rp ${formatRupiah(Math.abs(remaining))}`}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Metode Pembayaran</span>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'cash', label: 'Tunai', icon: Banknote },
                                    { id: 'transfer', label: 'Transfer', icon: CreditCard },
                                    { id: 'qris', label: 'QRIS', icon: QrCode }
                                ].map((method) => {
                                    const Icon = method.icon;
                                    const isSelected = data.payment_method === method.id;
                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setData('payment_method', method.id)}
                                            className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all ${isSelected
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                                : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-300'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{method.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {!isWarranty ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex flex-col gap-2 mb-4">
                            <Label className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4" /> Masa Berlaku Garansi (Hari)
                            </Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="number" min="0" max="365"
                                    className="w-16 h-8 text-sm bg-background border-emerald-500/30 text-center font-bold text-foreground px-1"
                                    value={data.warranty_days}
                                    onChange={(e) => setData('warranty_days', e.target.value)}
                                />
                                <div className="flex flex-wrap gap-2 flex-1">
                                    {['0', '7', '14', '30', '90'].map((days) => (
                                        <Badge
                                            key={days}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-emerald-500/20 bg-background text-xs font-medium px-2.5 py-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 transition-colors"
                                            onClick={() => setData('warranty_days', days)}
                                        >
                                            {days === '30' ? '1 Bln' : days === '90' ? '3 Bln' : days}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-500/10 border border-blue-500/30 p-3.5 rounded-xl mb-4">
                            <p className="text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Ini adalah unit Klaim Garansi. Tidak ada garansi baru yang diterbitkan.
                            </p>
                        </div>
                    )}

                    <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                        <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" /> Histori Teknisi
                        </Label>
                        <Textarea disabled className="flex-1 resize-none bg-muted text-xs p-3 text-muted-foreground custom-scrollbar min-h-[60px]" value={data.technician_notes} />
                    </div>
                </div>
            );
        }

        if (status === 'cancelled') {
            return (
                <div className="flex flex-col h-full space-y-4">
                    {warningBawaPulang}
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-6 rounded-xl w-full text-center space-y-2 flex-1 flex flex-col justify-center items-center">
                        <div className="mx-auto w-12 h-12 bg-white dark:bg-red-900/40 rounded-full flex items-center justify-center mb-2 shadow-sm">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h4 className="font-bold text-red-900 dark:text-red-100 uppercase tracking-wide">Servis Dibatalkan</h4>
                        <p className="text-sm text-red-800/80 dark:text-red-200/80">
                            Servis ini telah dibatalkan. Menunggu pelanggan untuk mengambil unitnya kembali.
                        </p>
                    </div>
                </div>
            );
        }

        if (status === 'taken' || status === 'returned') {
            return (
                <div className="flex flex-col h-full items-center justify-center space-y-4">
                    <div className="bg-muted border border-border p-6 rounded-xl w-full text-center space-y-2 flex-1 flex flex-col justify-center items-center">
                        <div className={`mx-auto w-12 h-12 bg-background rounded-full flex items-center justify-center mb-2 shadow-sm ${status === 'returned' ? 'text-orange-500' : 'text-emerald-600'}`}>
                            {status === 'returned' ? <XCircle className="h-6 w-6" /> : <HandCoins className="h-6 w-6" />}
                        </div>
                        <h4 className="font-bold text-foreground uppercase tracking-wide">{service.status_label}</h4>
                        <p className="text-sm text-muted-foreground">Siklus operasional nota ini telah ditutup secara permanen.</p>
                    </div>
                </div>
            );
        }
    };

    const renderFormActions = () => {
        const status = service.status;

        if (status === 'waiting_checking') {
            return (
                <div className="flex items-center justify-between w-full">
                    <Button type="button" size="sm" variant="ghost" className="text-muted-foreground" onClick={onClose} disabled={processing}>Tutup</Button>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" size="sm" variant="outline" className="px-2" disabled={processing}>
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => processAction(status)}>
                                    <Save className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Simpan Draf</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => processAction('waiting_approval', false)}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Lanjut (Tanpa WA)</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => setAlertConfig({ open: true, action: 'cancelled', isWa: false, title: 'Batalkan Servis', desc: 'Yakin membatalkan servis ini? Status nota akan ditutup.' })}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    <span>Batalkan Servis</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={() => processAction('waiting_approval', true)} disabled={processing}>
                            <Send className="h-4 w-4 mr-1.5" /> Kirim Penawaran WA
                        </Button>
                    </div>
                </div>
            );
        }

        if (status === 'waiting_approval') {
            return (
                <div className="flex items-center justify-between w-full">
                    <Button type="button" size="sm" variant="ghost" className="text-muted-foreground" onClick={onClose} disabled={processing}>Tutup</Button>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" size="sm" variant="outline" className="px-2" disabled={processing}>
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => processAction(status)}>
                                    <Save className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Simpan Draf</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => setAlertConfig({ open: true, action: 'cancelled', isWa: false, title: 'Batalkan Servis', desc: 'Yakin membatalkan servis ini?' })}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    <span>Batalkan Servis</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => processAction('approved', false)} disabled={processing}>
                            <CheckCircle className="h-4 w-4 mr-1.5" /> Disetujui Pelanggan
                        </Button>
                    </div>
                </div>
            );
        }

        if (status === 'approved') {
            return (
                <div className="flex items-center justify-between w-full">
                    <Button type="button" size="sm" variant="ghost" className="text-muted-foreground" onClick={onClose} disabled={processing}>Tutup</Button>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" size="sm" variant="outline" className="px-2" disabled={processing}>
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => processAction(status)}>
                                    <Save className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Simpan Draf</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => setAlertConfig({ open: true, action: 'cancelled', isWa: false, title: 'Batalkan Servis', desc: 'Yakin membatalkan servis ini?' })}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    <span>Batalkan Servis</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => processAction('in_progress')} disabled={processing}>
                            <Play className="h-4 w-4 mr-1.5 fill-current" /> Mulai Kerjakan
                        </Button>
                    </div>
                </div>
            );
        }

        if (status === 'in_progress') {
            return (
                <div className="flex items-center justify-between w-full">
                    <Button type="button" size="sm" variant="ghost" className="text-muted-foreground" onClick={onClose} disabled={processing}>Tutup</Button>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" size="sm" variant="outline" className="px-2" disabled={processing}>
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => processAction('in_progress')}>
                                    <Save className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Simpan Progres</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => processAction('completed', false)}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Selesai (Tanpa WA)</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => setAlertConfig({ open: true, action: 'cancelled', isWa: false, title: 'Batalkan Servis', desc: 'Yakin membatalkan servis ini?' })}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    <span>Batalkan Servis</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={() => processAction('completed', true)} disabled={processing}>
                            <Send className="h-4 w-4 mr-1.5" /> Selesai & WA
                        </Button>
                    </div>
                </div>
            );
        }

        if (status === 'completed') {
            return (
                <div className="flex items-center justify-between w-full">
                    <Button type="button" size="sm" variant="ghost" className="text-muted-foreground" onClick={onClose} disabled={processing}>Tutup</Button>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" size="sm" variant="outline" className="px-2" disabled={processing}>
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => processAction('completed')}>
                                    <Save className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Update Tagihan</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setAlertConfig({ open: true, action: 'taken', isWa: false, title: 'Serahkan Unit (Senyap)', desc: 'Nota akan ditutup permanen dan garansi diaktifkan tanpa mengirim WA.' })}>
                                    <HandCoins className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Serahkan (Tanpa WA)</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm" onClick={() => setAlertConfig({ open: true, action: 'taken', isWa: true, title: 'Serahkan Unit & WA', desc: 'Nota akan ditutup permanen dan garansi akan dikirimkan ke WA pelanggan.' })} disabled={processing}>
                            <HandCoins className="h-4 w-4 mr-1.5" /> Serahkan & WA
                        </Button>
                    </div>
                </div>
            );
        }

        if (status === 'cancelled') {
            return (
                <div className="flex items-center justify-between w-full">
                    <Button type="button" size="sm" variant="ghost" className="text-muted-foreground" onClick={onClose} disabled={processing}>Tutup</Button>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" size="sm" variant="outline" className="px-2" disabled={processing}>
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => setAlertConfig({ open: true, action: 'returned', isWa: false, title: 'Kembalikan Unit (Senyap)', desc: 'Nota akan ditutup permanen sebagai servis batal (tanpa WA).' })}>
                                    <HandCoins className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Kembalikan (Tanpa WA)</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button type="button" size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-sm" onClick={() => setAlertConfig({ open: true, action: 'returned', isWa: true, title: 'Kembalikan Unit & WA', desc: 'Nota akan ditutup permanen dan WA Batal dikirimkan.' })} disabled={processing}>
                            <HandCoins className="h-4 w-4 mr-1.5" /> Kembalikan & WA
                        </Button>
                    </div>
                </div>
            );
        }

        if (status === 'taken' || status === 'returned') {
            return (
                <Button type="button" size="sm" variant="outline" className="w-full" onClick={onClose}>Tutup Panel</Button>
            );
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent showCloseButton={false} className="max-h-[90vh] flex flex-col sm:max-w-[500px] p-0 rounded-xl shadow-2xl border-border overflow-hidden bg-card">

                    <div className="shrink-0 flex items-center justify-between border-b border-border bg-muted/20 p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Wrench className="h-5 w-5 text-primary" />
                            </div>
                            <DialogHeader className="text-left space-y-0 text-left sm:text-left">
                                <div className="flex items-center gap-2">
                                    <DialogTitle className="text-sm font-bold text-foreground">
                                        {service.order_number}
                                    </DialogTitle>
                                    <Badge
                                        variant="secondary"
                                        className="text-[9px] px-1.5 h-4 bg-primary/10 text-primary uppercase shadow-none border-none tracking-wider"
                                    >
                                        {service.status_label}
                                    </Badge>
                                </div>
                                <DialogDescription className="text-[11px] mt-0.5">
                                    Unit: {service.device_name}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        {/* Indikator Fisik Unit */}
                        {!['taken', 'returned'].includes(service.status) && (
                            <div className="hidden sm:flex flex-col items-end">
                                {service.is_unit_left_at_store ? (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 shadow-none text-[10px] font-semibold flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Di Toko
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 shadow-none text-[10px] font-semibold flex items-center gap-1">
                                        <Home className="h-3 w-3" /> Dibawa Pulang
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                        <form onSubmit={(e) => e.preventDefault()} className="h-full">
                            {renderFormContent()}
                        </form>
                    </div>

                    <div className="flex shrink-0 items-center border-t border-border bg-muted/20 p-4">
                        {renderFormActions()}
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={alertConfig.open} onOpenChange={(open) => {
                setAlertConfig(prev => ({ ...prev, open }));
                if (!open && alertConfig.action === 'cancelled') setData('final_cost', '');
            }}>
                <AlertDialogContent className="rounded-xl border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                            {alertConfig.desc}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {alertConfig.action === 'cancelled' && (
                        <div className="py-2">
                            <Label className="text-xs mb-1.5 block">Biaya Pengecekan (Opsional)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">Rp</span>
                                <Input
                                    type="number"
                                    min="0"
                                    className="pl-9 h-9"
                                    placeholder="0 (Kosongkan jika gratis)"
                                    value={data.final_cost || ''}
                                    onChange={(e) => setData('final_cost', e.target.value)}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1.5">Isi jika toko menerapkan tarif/biaya pengecekan (checking fee) untuk servis yang dibatalkan.</p>
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAlert}
                            className={alertConfig.action === 'cancelled' ? 'bg-destructive hover:bg-destructive/90 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'}
                        >
                            Ya, Lanjutkan Eksekusi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
