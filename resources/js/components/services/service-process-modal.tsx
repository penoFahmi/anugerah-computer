import { useForm, router } from '@inertiajs/react';
import { Loader2, Wrench, FileText, Send, Check, Play, CheckCircle2, XCircle, HandCoins, ShieldCheck, Save } from 'lucide-react';
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
}

export function ServiceProcessModal({ isOpen, onClose, service }: ServiceProcessModalProps) {
    // 1. TAMBAHKAN down_payment DI SINI
    const { data, setData, processing, clearErrors } = useForm({
        estimated_cost: '',
        final_cost: '',
        down_payment: '', 
        technician_notes: '',
        warranty_days: '30',
        is_full_update: false,
    });

    const [alertConfig, setAlertConfig] = useState<{ open: boolean; action: string; title: string; desc: string }>({
        open: false, action: '', title: '', desc: '',
    });

    useEffect(() => {
        if (isOpen && service) {
            setData({
                estimated_cost: service.estimated_cost ? Math.round(Number(service.estimated_cost)).toString() : '',
                final_cost: service.final_cost ? Math.round(Number(service.final_cost)).toString() : (service.estimated_cost ? Math.round(Number(service.estimated_cost)).toString() : ''),
                down_payment: service.down_payment ? Math.round(Number(service.down_payment)).toString() : '', // SET DP AWAL DARI DB
                technician_notes: service.technician_notes || '', 
                warranty_days: '30', 
                is_full_update: false,
            });
            clearErrors();
        }
    }, [isOpen, service]);

    if (!service) return null;

    const processAction = (targetStatus: string, isTriggerWa: boolean = false) => {
        if (isTriggerWa && (!data.estimated_cost || Number(data.estimated_cost) <= 0)) {
            toast.error('Gagal: Estimasi biaya harus diisi di atas Rp 0 untuk mengirim penawaran.');
            return;
        }

        // 2. PERBAIKAN FATAL: MASUKKAN down_payment KE PAYLOAD
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
                <>
                    <UIAlert className="bg-slate-50 border-slate-200 py-2">
                        <AlertDescription className="text-slate-600 text-[11px] leading-tight">
                            Lakukan pengecekan awal. Masukkan estimasi lalu klik "Kirim Penawaran WA".
                        </AlertDescription>
                    </UIAlert>
                    <div className="space-y-1.5 mt-3">
                        <Label className="text-xs font-semibold text-slate-700">Estimasi Biaya Pengecekan (Rp)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                            <Input type="number" min="0" className="pl-9 h-8 text-sm bg-white" value={data.estimated_cost} onChange={(e) => setData('estimated_cost', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-1.5 mt-3">
                        <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Catatan Pengecekan</Label>
                        <Textarea className="h-16 text-sm resize-none bg-white" value={data.technician_notes} onChange={(e) => setData('technician_notes', e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t mt-4">
                        <Button type="button" size="sm" variant="outline" onClick={() => processAction('waiting_checking')} disabled={processing}>
                            {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />} Simpan
                        </Button>
                        <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => processAction('waiting_approval', true)} disabled={processing}>
                            <Send className="h-3.5 w-3.5 mr-1.5" /> Kirim Penawaran WA
                        </Button>
                    </div>
                </>
            );
        }

        if (status === 'waiting_approval' || status === 'approved') {
            return (
                <>
                    <UIAlert className={`py-2 ${status === 'approved' ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
                        <AlertDescription className={`text-[11px] leading-tight ${status === 'approved' ? 'text-emerald-700 font-medium' : 'text-orange-700'}`}>
                            {status === 'approved' ? 'Pelanggan telah MENYETUJUI biaya. Silakan "Mulai Kerjakan".' : 'Menunggu konfirmasi. Mulai jika pelanggan setuju lisan.'}
                        </AlertDescription>
                    </UIAlert>
                    <div className="space-y-1.5 mt-3">
                        <Label className="text-xs font-semibold text-slate-700">Estimasi Biaya Kesepakatan</Label>
                        <Input disabled className="bg-slate-100 font-bold h-8 text-sm" value={`Rp ${formatRupiah(data.estimated_cost)}`} />
                    </div>
                    <div className="space-y-1.5 mt-3">
                        <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Catatan Teknisi</Label>
                        <Textarea className="h-16 text-sm resize-none bg-white" value={data.technician_notes} onChange={(e) => setData('technician_notes', e.target.value)} />
                    </div>
                    <div className="flex justify-between gap-2 pt-3 border-t mt-4">
                        <Button type="button" size="sm" variant="destructive" onClick={() => setAlertConfig({ open: true, action: 'cancelled', title: 'Batalkan Servis', desc: 'Yakin membatalkan servis ini? Status nota akan ditutup.' })} disabled={processing}>
                            <XCircle className="h-3.5 w-3.5 mr-1.5" /> Batalkan
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => processAction(status)} disabled={processing}>Simpan</Button>
                            <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => processAction('in_progress')} disabled={processing}>
                                <Play className="h-3.5 w-3.5 mr-1.5" /> Mulai Kerjakan
                            </Button>
                        </div>
                    </div>
                </>
            );
        }

        if (status === 'in_progress') {
            return (
                <>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-slate-500">Estimasi Awal</Label>
                            <Input disabled className="bg-slate-50 h-8 text-sm" value={`Rp ${formatRupiah(data.estimated_cost)}`} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-800">Biaya Akhir (Final Cost)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                                <Input type="number" min="0" className="pl-8 h-8 text-sm border-blue-300 focus-visible:ring-blue-500 font-bold text-blue-700 bg-white" value={data.final_cost} onChange={(e) => setData('final_cost', e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5 mt-3">
                        <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Tindakan yang Dilakukan</Label>
                        <Textarea placeholder="Sparepart diganti..." className="h-16 text-sm resize-none bg-white" value={data.technician_notes} onChange={(e) => setData('technician_notes', e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t mt-4">
                        <Button type="button" size="sm" variant="outline" onClick={() => processAction('in_progress')} disabled={processing}>Simpan Progress</Button>
                        <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => processAction('completed')} disabled={processing}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Tandai Selesai
                        </Button>
                    </div>
                </>
            );
        }

        if (status === 'completed') {
            const dp = Number(data.down_payment || 0);
            const finalCost = Number(data.final_cost || data.estimated_cost || 0);
            const remaining = finalCost - dp;

            return (
                <>
                    {/* KALKULATOR DIPADATKAN (COMPACT) */}
                    <div className="bg-slate-900 rounded-lg p-3 text-white shadow-inner mb-3">
                        <div className="flex justify-between items-center mb-1.5 border-b border-slate-700 pb-1.5">
                            <span className="text-xs text-slate-300">Biaya Akhir (Final)</span>
                            <span className="text-sm font-mono">Rp {formatRupiah(finalCost)}</span>
                        </div>
                        
                        {/* INPUT DP BISA DIEDIT */}
                        <div className="flex justify-between items-center mb-1.5 border-b border-slate-700 pb-1.5">
                            <span className="text-xs text-slate-300">DP / Dibayar</span>
                            <div className="relative w-28">
                                <span className="absolute left-2 top-1.5 text-[10px] font-bold text-slate-400">Rp</span>
                                <Input 
                                    type="number" min="0" 
                                    className="pl-7 h-6 text-xs bg-slate-800 border-slate-600 text-emerald-400 font-mono text-right" 
                                    value={data.down_payment} 
                                    onChange={(e) => setData('down_payment', e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-0.5">
                            <span className="text-sm font-bold text-slate-100">Sisa Tagihan</span>
                            <span className={`text-lg font-bold font-mono ${remaining > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                Rp {formatRupiah(remaining > 0 ? remaining : 0)}
                            </span>
                        </div>
                    </div>
                    
                    {/* GARANSI 1 BARIS (COMPACT) */}
                    <div className="mb-3 bg-emerald-50 border border-emerald-100 p-2 rounded-lg flex flex-col gap-1.5">
                        <Label className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5" /> Masa Garansi (Hari)
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number" min="0" max="365"
                                className="w-14 h-7 text-xs bg-white border-emerald-300 text-center font-bold text-emerald-800 px-1" 
                                value={data.warranty_days} 
                                onChange={(e) => setData('warranty_days', e.target.value)} 
                            />
                            <div className="flex flex-wrap gap-1 flex-1">
                                <Badge variant="outline" className="cursor-pointer hover:bg-emerald-100 bg-white text-[10px] px-1.5 py-0 h-6 border-emerald-200 text-emerald-700" onClick={() => setData('warranty_days', '0')}>0</Badge>
                                <Badge variant="outline" className="cursor-pointer hover:bg-emerald-100 bg-white text-[10px] px-1.5 py-0 h-6 border-emerald-200 text-emerald-700" onClick={() => setData('warranty_days', '7')}>7</Badge>
                                <Badge variant="outline" className="cursor-pointer hover:bg-emerald-100 bg-white text-[10px] px-1.5 py-0 h-6 border-emerald-200 text-emerald-700" onClick={() => setData('warranty_days', '14')}>14</Badge>
                                <Badge variant="outline" className="cursor-pointer hover:bg-emerald-100 bg-white text-[10px] px-1.5 py-0 h-6 border-emerald-200 text-emerald-700" onClick={() => setData('warranty_days', '30')}>1 Bln</Badge>
                                <Badge variant="outline" className="cursor-pointer hover:bg-emerald-100 bg-white text-[10px] px-1.5 py-0 h-6 border-emerald-200 text-emerald-700" onClick={() => setData('warranty_days', '90')}>3 Bln</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Catatan Teknisi diturunkan tingginya */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Catatan Riwayat Teknisi</Label>
                        <Textarea disabled className="h-12 resize-none bg-slate-50 text-[11px] p-2 text-slate-600" value={data.technician_notes} />
                    </div>

                    <div className="flex justify-between gap-2 pt-3 border-t mt-4">
                        <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={processing}>Tutup</Button>
                        <div className="flex gap-2">
                            {/* TOMBOL SIMPAN TITIPAN (CUMA UPDATE DP, STATUS TETAP) */}
                            <Button type="button" size="sm" variant="outline" onClick={() => processAction('completed')} disabled={processing}>
                                <Save className="h-3.5 w-3.5 mr-1" /> Simpan Titipan
                            </Button>
                            <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => setAlertConfig({ open: true, action: 'taken', title: 'Serahkan Unit', desc: 'Pastikan pembayaran sesuai tagihan. Nota akan ditutup permanen.' })} disabled={processing}>
                                <HandCoins className="h-3.5 w-3.5 mr-1" /> Serahkan Unit
                            </Button>
                        </div>
                    </div>
                </>
            );
        }

        if (status === 'taken' || status === 'cancelled') {
            return (
                <>
                    <UIAlert className="bg-slate-100 border-slate-200 py-3">
                        <AlertDescription className="text-slate-600 text-sm font-medium text-center">
                            Nota ini telah ditutup permanen: <span className="uppercase font-bold">{service.status_label}</span>
                        </AlertDescription>
                    </UIAlert>
                    <div className="flex justify-center pt-3 border-t mt-4">
                        <Button type="button" size="sm" variant="outline" onClick={onClose}>Tutup Layar</Button>
                    </div>
                </>
            );
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                {/* UKURAN MODAL DIPERKECIL (max-w-[480px]) */}
                <DialogContent className="sm:max-w-[480px] max-h-[95vh] overflow-y-auto rounded-xl border border-slate-200 p-0 shadow-xl">
                    <div className="p-4 border-b bg-slate-50/50">
                        <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-blue-600" /> Proses Operasional
                        </DialogTitle>
                        <DialogDescription className="text-[11px] text-slate-500 mt-1">
                            Unit: <span className="font-semibold text-slate-700">{service.device_name}</span> &nbsp;|&nbsp; Nota: <span className="font-bold text-blue-600 font-mono">{service.order_number}</span>
                        </DialogDescription>
                        <div className="mt-2">
                            <Badge variant="outline" className="uppercase bg-white shadow-sm text-[10px] px-2 py-0">{service.status_label}</Badge>
                        </div>
                    </div>

                    <div className="p-5">
                        <form onSubmit={(e) => e.preventDefault()}>
                            {renderFormContent()}
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={alertConfig.open} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, open }))}>
                <AlertDialogContent>
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
                            className={alertConfig.action === 'cancelled' ? 'bg-destructive hover:bg-destructive/90 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                        >
                            Ya, Lanjutkan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}