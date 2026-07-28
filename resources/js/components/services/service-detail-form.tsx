import { useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { formatIndonesianPhone } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import type { ServiceListItem } from '@/types/service';

interface ExtendedService extends ServiceListItem {
    customer?: any;
    device?: any;
}

export function ServiceDetailForm({ service }: { service: ExtendedService }) {
    const { data, setData, put, processing, errors, transform } = useForm({
        name: service.customer?.name || '',
        phone: service.customer?.phone || '',
        device_type: service.device?.device_type || 'Laptop',
        brand: service.device?.brand || '',
        model: service.device?.model || '',
        complaint: service.complaint || '',
        equipments: service.equipments ? (typeof service.equipments === 'string' ? JSON.parse(service.equipments) : service.equipments) : [],
        status: service.status || '',
        estimated_cost: service.estimated_cost ? Math.round(Number(service.estimated_cost)).toString() : '',
        final_cost: service.final_cost ? Math.round(Number(service.final_cost)).toString() : '',
        down_payment: service.down_payment ? Math.round(Number(service.down_payment)).toString() : '',
        payment_method: service.payment_method || 'cash',
        warranty_days: service.warranty_days?.toString() || '0',
        technician_notes: service.technician_notes || '',
        is_full_update: true, 
    });

    const COMMON_EQUIPMENTS = ['Charger', 'Tas', 'Mouse', 'Keyboard', 'Box'];
    const DEVICE_TYPES = ['Laptop', 'PC Desktop', 'Printer', 'Proyektor', 'All-in-One PC', 'Handphone', 'Lainnya'];

    const formatRupiah = (angka: string | number | null | undefined) => {
        if (!angka) return '';
        return new Intl.NumberFormat('id-ID').format(Number(angka));
    };

    const handleEquipmentToggle = (item: string) => {
        const current = [...data.equipments];
        if (current.includes(item)) setData('equipments', current.filter((i: string) => i !== item));
        else setData('equipments', [...current, item]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalPhone = data.phone.replace(/\D/g, '');
        if (finalPhone.startsWith('0')) finalPhone = '62' + finalPhone.substring(1);
        else if (finalPhone.startsWith('8') && finalPhone.length >= 1) finalPhone = '62' + finalPhone;

        transform((currentData) => ({
            ...currentData,
            phone: finalPhone,
            estimated_cost: currentData.estimated_cost ? Number(currentData.estimated_cost) : null,
            final_cost: currentData.final_cost ? Number(currentData.final_cost) : null,
            down_payment: currentData.down_payment ? Number(currentData.down_payment) : null,
            warranty_days: currentData.warranty_days ? Number(currentData.warranty_days) : 0,
        }));

        put(`/services/${service.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* --- KOLOM 1: PELANGGAN & PERANGKAT --- */}
                    <div className="space-y-6">
                        {/* Info Pelanggan */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-xs border-b border-border/60 pb-1.5 text-foreground uppercase tracking-wider">Info Pelanggan</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Nama Lengkap</Label>
                                    <Input className="h-8 text-xs bg-background" value={data.name} onChange={e => setData('name', e.target.value)} />
                                    {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Nomor WA</Label>
                                    <Input className="h-8 text-xs bg-background" value={data.phone} onChange={e => setData('phone', formatIndonesianPhone(e.target.value))} />
                                    {errors.phone && <p className="text-[10px] text-destructive">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Detail Perangkat */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-xs border-b border-border/60 pb-1.5 text-foreground uppercase tracking-wider">Detail Perangkat</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Kategori</Label>
                                    <Select value={data.device_type} onValueChange={(val) => setData('device_type', val)}>
                                        <SelectTrigger className="h-8 text-xs bg-background">
                                            <SelectValue placeholder="Pilih kategori..." />
                                        </SelectTrigger>
                                        <SelectContent className="text-xs">
                                            {DEVICE_TYPES.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Merek</Label>
                                    <Input className="h-8 text-xs bg-background" value={data.brand} onChange={e => setData('brand', e.target.value)} />
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-xs text-muted-foreground">Tipe/Model</Label>
                                    <Input className="h-8 text-xs bg-background" value={data.model} onChange={e => setData('model', e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Keluhan Awal</Label>
                                <Textarea className="h-14 text-xs resize-none py-2 bg-background" value={data.complaint} onChange={e => setData('complaint', e.target.value)} />
                                {errors.complaint && <p className="text-[10px] text-destructive">{errors.complaint}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground mb-1 block">Kelengkapan Unit</Label>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_EQUIPMENTS.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => handleEquipmentToggle(item)}
                                            className={`text-[10px] px-2 py-1 border rounded-md transition-colors ${
                                                data.equipments.includes(item) 
                                                ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300' 
                                                : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- KOLOM 2: OPERASIONAL TEKNISI --- */}
                    <div className="flex flex-col space-y-4">
                        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 space-y-4">
                            <h3 className="font-semibold text-xs border-b border-blue-200 dark:border-blue-800 pb-1.5 text-blue-800 dark:text-blue-300 uppercase tracking-wider">Status & Keuangan</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-blue-900/80 dark:text-blue-200">Status Kerja</Label>
                                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                        <SelectTrigger className="h-8 text-xs bg-background border-blue-200 dark:border-blue-800">
                                            <SelectValue placeholder="Pilih status..." />
                                        </SelectTrigger>
                                        <SelectContent className="text-xs">
                                            <SelectItem value="waiting_checking">Menunggu Dicek</SelectItem>
                                            <SelectItem value="waiting_approval">Menunggu Konfirmasi</SelectItem>
                                            <SelectItem value="approved">Disetujui</SelectItem>
                                            <SelectItem value="in_progress">Sedang Diperbaiki</SelectItem>
                                            <SelectItem value="completed">Selesai (Siap Diambil)</SelectItem>
                                            <SelectItem value="taken">Sudah Diambil</SelectItem>
                                            <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-blue-900/80 dark:text-blue-200">Garansi (Hari)</Label>
                                    <Input 
                                        type="number" min="0" 
                                        className="h-8 text-xs bg-background border-blue-200 dark:border-blue-800" 
                                        value={data.warranty_days} 
                                        onChange={e => setData('warranty_days', e.target.value)} 
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-blue-900/80 dark:text-blue-200">Estimasi Awal</Label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-2 text-[10px] font-bold text-blue-900/50 dark:text-blue-200/50">Rp</span>
                                        <Input 
                                            type="text" 
                                            value={data.estimated_cost ? formatRupiah(data.estimated_cost) : ''} 
                                            onChange={e => setData('estimated_cost', e.target.value.replace(/\D/g, ''))} 
                                            className="h-8 pl-6 text-xs bg-background border-blue-200 dark:border-blue-800 font-mono" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-blue-900 dark:text-blue-200">Biaya Akhir</Label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-2 text-[10px] font-bold text-blue-900/50 dark:text-blue-200/50">Rp</span>
                                        <Input 
                                            type="text" 
                                            value={data.final_cost ? formatRupiah(data.final_cost) : ''} 
                                            onChange={e => setData('final_cost', e.target.value.replace(/\D/g, ''))} 
                                            className="h-8 pl-6 text-xs bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 font-mono font-bold" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-blue-900/80 dark:text-blue-200">Uang Muka / DP</Label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-2 text-[10px] font-bold text-blue-900/50 dark:text-blue-200/50">Rp</span>
                                        <Input 
                                            type="text" 
                                            value={data.down_payment ? formatRupiah(data.down_payment) : ''} 
                                            onChange={e => setData('down_payment', e.target.value.replace(/\D/g, ''))} 
                                            className="h-8 pl-6 text-xs bg-background border-blue-200 dark:border-blue-800 font-mono" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-blue-900/80 dark:text-blue-200">Metode Bayar</Label>
                                    <Select value={data.payment_method} onValueChange={(val) => setData('payment_method', val)}>
                                        <SelectTrigger className="h-8 text-xs bg-background border-blue-200 dark:border-blue-800 uppercase">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="text-xs">
                                            <SelectItem value="cash">Tunai (Cash)</SelectItem>
                                            <SelectItem value="transfer">Transfer</SelectItem>
                                            <SelectItem value="qris">QRIS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-h-[120px] bg-blue-50/30 dark:bg-blue-950/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-2">
                            <Label className="text-xs text-blue-900/80 dark:text-blue-200 font-semibold">Catatan Teknisi / Tindakan</Label>
                            <Textarea 
                                className="flex-1 text-xs resize-none bg-background p-3 border-blue-200 dark:border-blue-800 custom-scrollbar" 
                                value={data.technician_notes} 
                                onChange={e => setData('technician_notes', e.target.value)} 
                                placeholder="Jelaskan perbaikan yang dilakukan..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="shrink-0 flex items-center justify-end p-4 border-t border-border bg-muted/10">
                <Button type="submit" disabled={processing} className="min-w-[160px] h-9 text-xs font-semibold shadow-sm">
                    {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} 
                    Simpan Perubahan Lengkap
                </Button>
            </div>
        </form>
    );
}
