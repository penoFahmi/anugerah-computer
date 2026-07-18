import { useForm, router } from '@inertiajs/react';
import { Loader2, Clock, Wrench, FileText, Send, Check, Play, CheckCircle2, XCircle, HandCoins, ShieldCheck, Save, Plus, Banknote, CreditCard, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

    const [alertConfig, setAlertConfig] = useState<{ open: boolean; action: string; title: string; desc: string }>({
        open: false, action: '', title: '', desc: '',
    });

    // State untuk input sparepart
    const [selectedSparepart, setSelectedSparepart] = useState<string>('');
    const [sparepartQty, setSparepartQty] = useState<number>(1);

    useEffect(() => {
        if (isOpen && service) {
            setData({
                estimated_cost: service.estimated_cost ? Math.round(Number(service.estimated_cost)).toString() : '',
                final_cost: service.final_cost ? Math.round(Number(service.final_cost)).toString() : (service.estimated_cost ? Math.round(Number(service.estimated_cost)).toString() : ''),
                down_payment: service.down_payment ? Math.round(Number(service.down_payment)).toString() : '',
                technician_notes: service.technician_notes || '', 
                warranty_days: '30', 
                is_full_update: false,
            });
            clearErrors();
            setSelectedSparepart('');
            setSparepartQty(1);
        }
    }, [isOpen, service]);

    if (!service) return null;

    const processAction = (targetStatus: string, isTriggerWa: boolean = false) => {
        // Reset state input sparepart
        setSelectedSparepart('');
        setSparepartQty(1);

        const isWarranty = service?.complaint?.startsWith('KLAIM GARANSI');
        if (isTriggerWa && (!data.estimated_cost || Number(data.estimated_cost) <= 0) && !isWarranty) {
            toast.error('Gagal: Estimasi biaya harus diisi di atas Rp 0 untuk mengirim penawaran (Kecuali Klaim Garansi).');
            return;
        }

        const payload = {
            status: targetStatus,
            estimated_cost: data.estimated_cost ? Number(data.estimated_cost) : null,
            final_cost: data.final_cost ? Number(data.final_cost) : null,
            down_payment: data.down_payment ? Number(data.down_payment) : 0, 
            technician_notes: data.technician_notes,
            warranty_days: data.warranty_days ? Number(data.warranty_days) : 0, 
            is_full_update: false,
        };

        if (isTriggerWa) {
            toast.loading('Menyimpan data dan memicu gateway WhatsApp...');
            router.put(`/services/${service.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    router.post(`/services/${service.id}/trigger-wa`, {}, {
                        preserveScroll: true,
                        onSuccess: () => { toast.dismiss(); toast.success('Penawaran WA berhasil dikirim.'); onClose(); },
                        onError: () => { toast.dismiss(); toast.error('Gagal mengirim WhatsApp.'); }
                    });
                },
                onError: () => { toast.dismiss(); toast.error('Gagal menyimpan biaya.'); }
            });
        } else {
            router.put(`/services/${service.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => { toast.success(`Nota ${service.order_number} berhasil diperbarui.`); onClose(); },
                onError: () => { toast.error('Gagal memperbarui operasional.'); }
            });
        }
    };

    const handleConfirmAlert = () => {
        if (alertConfig.action) processAction(alertConfig.action);
        setAlertConfig({ ...alertConfig, open: false });
    };

    const formatRupiah = (angka: string | number | null | undefined) => {
        if (!angka) return '0';
        return new Intl.NumberFormat('id-ID').format(Number(angka));
    };

    const renderFormContent = () => {
        const status = service.status;

        if (status === 'waiting_checking') {
            return (
                <div className="flex flex-col h-full space-y-4">
                    <UIAlert className="bg-muted/50 border-border py-2.5">
                        <AlertDescription className="text-muted-foreground text-xs leading-relaxed font-medium">
                            Lakukan pengecekan awal pada perangkat. Masukkan estimasi biaya di bawah, lalu klik "Kirim Penawaran WA". Jika unit tidak dapat diperbaiki, Anda bisa membatalkannya.
                        </AlertDescription>
                    </UIAlert>
                    
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Estimasi Biaya Pengecekan (Rp)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">Rp</span>
                            <Input type="number" min="0" className="pl-9 bg-background font-mono" value={data.estimated_cost} onChange={(e) => setData('estimated_cost', e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Catatan Pengecekan
                        </Label>
                        <Textarea className="flex-1 text-sm resize-none bg-background p-3 custom-scrollbar min-h-[80px]" placeholder="Misal: Sparepart kosong, IC Power mati..." value={data.technician_notes} onChange={(e) => setData('technician_notes', e.target.value)} />
                    </div>
                    
                    {/* [PERBAIKAN]: Area Tombol dengan penambahan Tombol Batal di sebelah kiri */}
                    <div className="flex justify-between items-center pt-4 border-t border-border shrink-0">
                        
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => setAlertConfig({ 
                                open: true, 
                                action: 'cancelled', 
                                title: 'Batalkan Servis', 
                                desc: 'Yakin membatalkan servis ini? (Pilih ini jika unit tidak bisa diperbaiki atau sparepart kosong).' 
                            })} 
                            disabled={processing}
                        >
                            <XCircle className="h-4 w-4 mr-1.5" /> Batal
                        </Button>

                        <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => processAction('waiting_checking')} disabled={processing}>
                                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />} Simpan Draf
                            </Button>
                            <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={() => processAction('waiting_approval', true)} disabled={processing}>
                                <Send className="h-4 w-4 mr-2" /> Kirim Penawaran WA
                            </Button>
                        </div>

                    </div>
                </div>
            );
        }

        if (status === 'waiting_approval' || status === 'approved') {
            return (
                <div className="flex flex-col h-full space-y-4">
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
                        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Catatan Teknisi
                        </Label>
                        <Textarea className="flex-1 text-sm resize-none bg-background p-3 custom-scrollbar min-h-[80px]" value={data.technician_notes} onChange={(e) => setData('technician_notes', e.target.value)} />
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-border shrink-0">
                        <Button type="button" size="sm" variant="destructive" onClick={() => setAlertConfig({ open: true, action: 'cancelled', title: 'Batalkan Servis', desc: 'Yakin membatalkan servis ini? Status nota akan ditutup.' })} disabled={processing}>
                            <XCircle className="h-4 w-4 mr-1.5" /> Batal
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => processAction(status)} disabled={processing}>Simpan</Button>
                            <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => processAction('in_progress')} disabled={processing}>
                                <Play className="h-4 w-4 mr-1.5 fill-current" /> Mulai Kerjakan
                            </Button>
                        </div>
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
                        
                        // Perbarui data final_cost di form secara reaktif jika diperlukan
                        // Tapi karena ini Inertia, prop service akan otomatis terupdate.
                    }
                });
            };

            return (
                <div className="flex flex-col h-full space-y-4">
                    {/* UI Input Sparepart */}
                    <div className="p-4 border border-border rounded-xl bg-muted/40 space-y-4 shrink-0">
                        <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                            Gunakan Sparepart / Jasa Tambahan
                        </Label>
                        <div className="flex gap-2">
                            <select 
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                                value={selectedSparepart}
                                onChange={(e) => setSelectedSparepart(e.target.value)}
                            >
                                <option value="">-- Cari atau Pilih Sparepart --</option>
                                {available_spare_parts?.map(sp => (
                                    <option key={sp.id} value={sp.id} disabled={!sp.is_always_indent && sp.stock <= 0}>
                                        {sp.name} - Rp {formatRupiah(sp.selling_price)} {(!sp.is_always_indent && sp.stock <= 0) ? '(Stok Habis)' : `(Tersedia: ${sp.stock})`}
                                    </option>
                                ))}
                            </select>
                            <Input 
                                type="number" min="1" 
                                className="w-16 h-9 px-2 text-center font-bold" 
                                value={sparepartQty}
                                onChange={(e) => setSparepartQty(Number(e.target.value))}
                                title="Kuantitas"
                            />
                            <Button type="button" size="sm" onClick={handleAddSparepart} disabled={!selectedSparepart || processing} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                <Plus className="h-4 w-4 mr-1" /> Tambah
                            </Button>
                        </div>
                        {service.spare_parts && service.spare_parts.length > 0 && (
                            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1 mt-3">
                                {service.spare_parts.map((sp: any) => (
                                    <div key={sp.id} className="text-xs flex justify-between items-center bg-background px-3 py-2.5 rounded-lg border border-border/80 shadow-sm transition-colors hover:bg-muted/50">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="px-1.5 h-5 min-w-[20px] justify-center">{sp.quantity}x</Badge>
                                            <span className="font-semibold text-foreground">{sp.name}</span>
                                        </div>
                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Rp {formatRupiah(sp.subtotal)}</span>
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
                        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Tindakan yang Dilakukan
                        </Label>
                        <Textarea placeholder="Sparepart yang diganti..." className="flex-1 text-sm resize-none bg-background p-3 custom-scrollbar min-h-[80px]" value={data.technician_notes} onChange={(e) => setData('technician_notes', e.target.value)} />
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-border shrink-0">
                        <Button type="button" size="sm" variant="destructive" onClick={() => setAlertConfig({ open: true, action: 'cancelled', title: 'Batalkan Servis', desc: 'Yakin membatalkan servis ini? Status nota akan ditutup.' })} disabled={processing}>
                            <XCircle className="h-4 w-4 mr-1.5" /> Batal
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => processAction('in_progress')} disabled={processing}>Simpan Progress</Button>
                            <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={() => processAction('completed')} disabled={processing}>
                                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Tandai Selesai
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (status === 'completed') {
            const dp = Number(data.down_payment || 0);
            const finalCost = Number(data.final_cost || data.estimated_cost || 0);
            const remaining = finalCost - dp;

            return (
                <div className="flex flex-col h-full space-y-4">
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-5 text-slate-100 shadow-xl border border-slate-800 shrink-0 relative overflow-hidden">
                        {/* Decorative Receipt Edge */}
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
                            <span className="text-sm font-bold text-white tracking-widest uppercase">Sisa Tagihan</span>
                            <span className={`text-2xl font-black font-mono tracking-tight ${remaining > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                Rp {formatRupiah(remaining > 0 ? remaining : 0)}
                            </span>
                        </div>

                        {/* Pilihan Pembayaran */}
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
                                            className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all ${
                                                isSelected 
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
                    
                    {/* Input Masa Garansi */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex flex-col gap-2">
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

                    {/* Area Catatan Baca Saja */}
                    <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                        <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" /> Histori Teknisi
                        </Label>
                        <Textarea disabled className="flex-1 resize-none bg-muted text-xs p-3 text-muted-foreground custom-scrollbar min-h-[60px]" value={data.technician_notes} />
                    </div>

                    <div className="flex justify-between items-center gap-2 pt-4 border-t border-border shrink-0">
                        <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={processing}>Tutup</Button>
                        <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => processAction('completed')} disabled={processing}>
                                <Save className="h-4 w-4 mr-1.5" /> Update Tagihan
                            </Button>
                            <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm" onClick={() => setAlertConfig({ open: true, action: 'taken', title: 'Serahkan Unit', desc: 'Pastikan pembayaran sesuai tagihan. Nota akan ditutup permanen dan garansi diaktifkan.' })} disabled={processing}>
                                <HandCoins className="h-4 w-4 mr-1.5" /> Serahkan Unit
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (status === 'cancelled') {
            return (
                <div className="flex flex-col h-full space-y-4">
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-6 rounded-xl w-full text-center space-y-2 flex-1 flex flex-col justify-center items-center">
                        <div className="mx-auto w-12 h-12 bg-white dark:bg-red-900/40 rounded-full flex items-center justify-center mb-2 shadow-sm">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h4 className="font-bold text-red-900 dark:text-red-100 uppercase tracking-wide">Servis Dibatalkan</h4>
                        <p className="text-sm text-red-800/80 dark:text-red-200/80">
                            Servis ini telah dibatalkan. Menunggu pelanggan untuk mengambil unitnya.
                        </p>
                    </div>
                    
                    <div className="flex justify-between items-center gap-2 pt-4 border-t border-border shrink-0">
                        <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={processing}>Tutup</Button>
                        <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm" onClick={() => setAlertConfig({ open: true, action: 'taken', title: 'Serahkan Unit', desc: 'Nota akan ditutup permanen.' })} disabled={processing}>
                            <HandCoins className="h-4 w-4 mr-1.5" /> Serahkan Unit
                        </Button>
                    </div>
                </div>
            );
        }

        if (status === 'taken') {
            return (
                <div className="flex flex-col h-full items-center justify-center space-y-4">
                    <div className="bg-muted border border-border p-6 rounded-xl w-full text-center space-y-2 flex-1 flex flex-col justify-center items-center">
                        <div className="mx-auto w-12 h-12 bg-background rounded-full flex items-center justify-center mb-2 shadow-sm">
                            <HandCoins className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h4 className="font-bold text-foreground uppercase tracking-wide">{service.status_label}</h4>
                        <p className="text-sm text-muted-foreground">Siklus operasional nota ini telah ditutup secara permanen.</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" className="w-full" onClick={onClose}>Tutup Panel</Button>
                </div>
            );
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                {/* Modal dibuat elegan dan terkunci dengan tinggi dinamis tapi membatasi overflow */}
                <DialogContent className="max-h-[90vh] flex flex-col sm:max-w-[500px] p-0 rounded-xl shadow-2xl border-border overflow-hidden bg-card">
                    
                    {/* Header Terkunci */}
                    <div className="p-5 border-b border-border bg-muted/20 shrink-0">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Pusat Kendali Operasional
                            </DialogTitle>
                            <DialogDescription className="text-xs mt-1.5">
                                Unit: <span className="font-semibold text-foreground">{service.device_name}</span> &nbsp;|&nbsp; Nota: <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{service.order_number}</span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-3">
                            <Badge variant="outline" className="uppercase bg-background shadow-sm text-[10px] px-2.5 py-0.5 tracking-wider border-border text-foreground">
                                {service.status_label}
                            </Badge>
                        </div>
                    </div>

                    {/* Area Konten Dinamis yang mengatur scroll-nya sendiri jika diperlukan */}
                    <div className="flex-1 overflow-hidden p-5">
                        <form onSubmit={(e) => e.preventDefault()} className="h-full">
                            {renderFormContent()}
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={alertConfig.open} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, open }))}>
                <AlertDialogContent className="rounded-xl border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                            {alertConfig.desc}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
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