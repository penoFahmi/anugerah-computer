import { useForm, router } from '@inertiajs/react';
import { Loader2, Settings, Check } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ServiceListItem } from '@/types/service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceListItem | null;
}

export function ServiceEditFullModal({ isOpen, onClose, service }: Props) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: '',
        phone: '',
        device_type: '',
        brand: '',
        model: '',
        complaint: '',
        status: '',
        is_full_update: true,
    });

    useEffect(() => {
        if (isOpen && service) {
            setData({
                name: service.customer_name || '',
                phone: service.customer_phone || '',
                device_type: service.device_type || 'Laptop',
                brand: service.brand || '',
                model: service.model || '',
                complaint: service.complaint || '',
                status: service.status || '',
                is_full_update: true,
            });
            clearErrors();
        }
    }, [isOpen, service]);

    if (!service) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/services/${service.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Data pelanggan dan unit berhasil dikoreksi.');
                onClose();
            },
            onError: () => {
                toast.error('Terdapat kesalahan validasi input.');
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <Settings className="h-5 w-5 text-slate-700" /> Koreksi Data Master
                        </DialogTitle>
                        <DialogDescription className="text-xs mt-1">
                            Gunakan form ini hanya untuk memperbaiki kesalahan penulisan data nota {service.order_number}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2 border-b pb-4">
                            <h4 className="text-sm font-semibold text-slate-800">Informasi Pelanggan</h4>
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Pelanggan</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Nomor WhatsApp</Label>
                            <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                        </div>

                        <div className="col-span-2 space-y-2 border-b pb-4 mt-4">
                            <h4 className="text-sm font-semibold text-slate-800">Informasi Perangkat</h4>
                        </div>
                        <div className="space-y-2">
                            <Label>Merek</Label>
                            <Input value={data.brand} onChange={(e) => setData('brand', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Model / Tipe</Label>
                            <Input value={data.model} onChange={(e) => setData('model', e.target.value)} />
                        </div>

                        <div className="col-span-2 space-y-2 mt-4">
                            <Label>Keluhan Awal</Label>
                            <Textarea className="h-20" value={data.complaint} onChange={(e) => setData('complaint', e.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />} Simpan Koreksi
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}