import { Form, useForm } from '@inertiajs/react';
import { Check, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ServiceDetailForm({ service }: { service: any }) {
    const { data, setData, put, processing, errors } = useForm({
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = { ...data, estimated_cost: data.estimated_cost ? Number(data.estimated_cost) : null };

        put(`/services/${service.id}`, {
            data: payload,
            preserveScroll: true,
            onSuccess: () => toast.success('Data detail servisan berhasil diperbarui.'),
            onError: () => toast.error('Gagal menyimpan. Periksa kembali form isian.'),
        });
    };

    return (
        <Form onSubmit={handleSubmit} className="flex flex-col h-full gap-4">
            
            {/* GRID MASTER DATA (Dibuat super rapat) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BLOK PELANGGAN */}
                <div className="bg-muted/30 p-3 rounded-lg border border-border">
                    <h3 className="font-semibold text-xs border-b pb-1.5 mb-2 text-slate-700">Info Pelanggan</h3>
                    <div className="space-y-2">
                        <div>
                            <Label className="text-[11px]">Nama Lengkap</Label>
                            <Input className="h-8 text-xs mt-0.5" value={data.name} onChange={e => setData('name', e.target.value)} />
                            {errors.name && <p className="text-[10px] text-destructive mt-0.5">{errors.name}</p>}
                        </div>
                        <div>
                            <Label className="text-[11px]">Nomor WA</Label>
                            <Input className="h-8 text-xs mt-0.5" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* BLOK PERANGKAT */}
                <div className="bg-muted/30 p-3 rounded-lg border border-border">
                    <h3 className="font-semibold text-xs border-b pb-1.5 mb-2 text-slate-700">Detail Perangkat</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-[11px]">Merek</Label>
                            <Input className="h-8 text-xs mt-0.5" value={data.brand} onChange={e => setData('brand', e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-[11px]">Tipe/Model</Label>
                            <Input className="h-8 text-xs mt-0.5" value={data.model} onChange={e => setData('model', e.target.value)} />
                        </div>
                    </div>
                    <div className="mt-2">
                        <Label className="text-[11px]">Keluhan Awal</Label>
                        <Textarea className="h-10 text-xs mt-0.5 resize-none py-1" value={data.complaint} onChange={e => setData('complaint', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* DATA OPERASIONAL TEKNISI */}
            <div className="bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900 flex-1 flex flex-col">
                <h3 className="font-semibold text-xs border-b pb-1.5 mb-2 text-blue-800 dark:text-blue-300">Data Operasional (Teknisi)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-[11px]">Status Kerja</Label>
                        <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                            <SelectTrigger className="h-8 text-xs bg-background mt-0.5">
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
                    <div>
                        <Label className="text-[11px]">Estimasi / Total Biaya (Rp)</Label>
                        <Input type="number" min="0" value={data.estimated_cost} onChange={e => setData('estimated_cost', e.target.value)} className="h-8 text-xs bg-background mt-0.5" />
                    </div>
                </div>

                <div className="mt-3 flex-1 flex flex-col">
                    <Label className="text-[11px]">Catatan Teknisi / Tindakan</Label>
                    <Textarea className="flex-1 min-h-[60px] text-xs mt-0.5 resize-none bg-background py-1" value={data.technician_notes} onChange={e => setData('technician_notes', e.target.value)} />
                </div>
            </div>

            {/* FOOTER TOMBOL */}
            <div className="flex justify-end pt-3 border-t shrink-0">
                <Button type="submit" disabled={processing} size="sm" className="min-w-[130px] h-8 text-xs">
                    {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />} 
                    Simpan Perubahan
                </Button>
            </div>
        </Form>
    );
}