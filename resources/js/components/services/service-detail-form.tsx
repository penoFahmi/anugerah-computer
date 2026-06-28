import { useForm } from '@inertiajs/react';
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
        <form onSubmit={handleSubmit} className="space-y-6 pb-6">
            
            {/* DATA MASTER PELANGGAN & PERANGKAT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                    <h3 className="font-semibold text-sm border-b pb-2">Informasi Pelanggan</h3>
                    <div className="space-y-2">
                        <Label>Nama Lengkap</Label>
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Nomor WhatsApp</Label>
                        <Input value={data.phone} onChange={e => setData('phone', e.target.value)} />
                    </div>
                </div>

                <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                    <h3 className="font-semibold text-sm border-b pb-2">Detail Perangkat</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Merek</Label>
                            <Input value={data.brand} onChange={e => setData('brand', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipe</Label>
                            <Input value={data.model} onChange={e => setData('model', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2 mt-2">
                        <Label>Keluhan Awal</Label>
                        <Textarea className="h-[75px] resize-none" value={data.complaint} onChange={e => setData('complaint', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* DATA OPERASIONAL TEKNISI */}
            <div className="space-y-4 bg-blue-50/50 dark:bg-blue-950/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
                <h3 className="font-semibold text-sm border-b pb-2 text-blue-800 dark:text-blue-300">Data Operasional (Teknisi)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Status Kerja</Label>
                        <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Pilih status..." />
                            </SelectTrigger>
                            <SelectContent>
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
                    <div className="space-y-2">
                        <Label>Estimasi / Total Biaya (Rp)</Label>
                        <Input type="number" min="0" value={data.estimated_cost} onChange={e => setData('estimated_cost', e.target.value)} className="bg-background" />
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    <Label>Catatan Teknisi / Tindakan Perbaikan</Label>
                    <Textarea className="h-[100px] resize-none bg-background" value={data.technician_notes} onChange={e => setData('technician_notes', e.target.value)} />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={processing} className="min-w-[150px]">
                    {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} 
                    Simpan Perubahan
                </Button>
            </div>
        </form>
    );
}