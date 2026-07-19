import { useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

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
    // Standar Inertia React: menggunakan hook useForm
    const { data, setData, put, processing, errors, transform } = useForm({
        name: service.customer?.name || '',
        phone: service.customer?.phone || '',
        device_type: service.device?.device_type || 'Laptop',
        brand: service.device?.brand || '',
        model: service.device?.model || '',
        complaint: service.complaint || '',
        status: service.status || '',
        estimated_cost: service.estimated_cost ? Math.round(Number(service.estimated_cost)).toString() : '',
        technician_notes: service.technician_notes || '',
        is_full_update: true, 
    });

    const formatRupiah = (angka: string | number | null | undefined) => {
        if (!angka) return '';
        return new Intl.NumberFormat('id-ID').format(Number(angka));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Transform data string menjadi null/number sesuai request backend
        transform((currentData) => ({
            ...currentData,
            estimated_cost: currentData.estimated_cost ? Number(currentData.estimated_cost) : null,
        }));

        put(`/services/${service.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Data detail servisan berhasil diperbarui.'),
            onError: () => toast.error('Gagal menyimpan. Periksa kembali form isian.'),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            
            {/* AREA FORM (Body): Flex-1 memastikan ia mengambil sisa ruang, tapi tidak menabrak footer */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                
                {/* Desain Padat 2 Kolom: Kiri untuk Data Pelanggan/Perangkat, Kanan untuk Teknisi */}
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
                                    <Input className="h-8 text-xs bg-background" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                    {errors.phone && <p className="text-[10px] text-destructive">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Detail Perangkat */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-xs border-b border-border/60 pb-1.5 text-foreground uppercase tracking-wider">Detail Perangkat</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Merek</Label>
                                    <Input className="h-8 text-xs bg-background" value={data.brand} onChange={e => setData('brand', e.target.value)} />
                                    {errors.brand && <p className="text-[10px] text-destructive">{errors.brand}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Tipe/Model</Label>
                                    <Input className="h-8 text-xs bg-background" value={data.model} onChange={e => setData('model', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Keluhan Awal</Label>
                                <Textarea className="h-14 text-xs resize-none py-2 bg-background" value={data.complaint} onChange={e => setData('complaint', e.target.value)} />
                                {errors.complaint && <p className="text-[10px] text-destructive">{errors.complaint}</p>}
                            </div>
                        </div>
                    </div>

                    {/* --- KOLOM 2: OPERASIONAL TEKNISI --- */}
                    <div className="flex flex-col bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                        <h3 className="font-semibold text-xs border-b border-blue-200 dark:border-blue-800 pb-1.5 mb-4 text-blue-800 dark:text-blue-300 uppercase tracking-wider">Data Operasional (Teknisi)</h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
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
                                <Label className="text-xs text-blue-900/80 dark:text-blue-200">Total Biaya (Rp)</Label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-xs font-bold text-blue-900/50 dark:text-blue-200/50">Rp</span>
                                    <Input 
                                        type="text" 
                                        value={data.estimated_cost ? formatRupiah(data.estimated_cost) : ''} 
                                        onChange={e => {
                                            const clean = e.target.value.replace(/\D/g, '');
                                            setData('estimated_cost', clean);
                                        }} 
                                        className="h-8 pl-8 text-xs bg-background border-blue-200 dark:border-blue-800 font-mono" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Catatan ini mengisi otomatis sisa ruang di sisi kanan */}
                        <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
                            <Label className="text-xs text-blue-900/80 dark:text-blue-200">Catatan Teknisi / Tindakan</Label>
                            <Textarea className="flex-1 text-xs resize-none bg-background p-3 border-blue-200 dark:border-blue-800 custom-scrollbar" value={data.technician_notes} onChange={e => setData('technician_notes', e.target.value)} />
                        </div>
                    </div>

                </div>
            </div>

            {/* AREA FOOTER (Tombol Simpan): Terkunci mati di dasar form berkat shrink-0 */}
            <div className="shrink-0 flex items-center justify-end p-4 border-t border-border bg-muted/10">
                <Button type="submit" disabled={processing} className="min-w-[160px] h-9 text-xs font-semibold shadow-sm">
                    {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} 
                    Simpan Perubahan
                </Button>
            </div>
        </form>
    );
}