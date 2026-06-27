import { useForm, router } from '@inertiajs/react';
import { Loader2, Wrench, FileText, Send, Check } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ServiceListItem } from '@/types/service';

interface ServiceProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceListItem | null;
}

export function ServiceProcessModal({ isOpen, onClose, service }: ServiceProcessModalProps) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        status: '',
        estimated_cost: '',
        technician_notes: '',
        is_full_update: false,
    });

    useEffect(() => {
        if (isOpen && service) {
            setData({
                status: service.status,
                estimated_cost: service.estimated_cost ? Math.round(Number(service.estimated_cost)).toString() : '',
                technician_notes: service.technician_notes || '', 
                is_full_update: false,
            });
            clearErrors();
        }
    }, [isOpen, service]);

    if (!service) return null;

    const handleSubmitUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            status: data.status,
            estimated_cost: data.estimated_cost ? Number(data.estimated_cost) : null,
            technician_notes: data.technician_notes,
            is_full_update: false,
        };

        router.put(`/services/${service.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Nota ${service.order_number} berhasil diperbarui.`);
                onClose();
            },
            onError: () => {
                toast.error('Gagal memperbarui data operasional.');
            }
        });
    };

    const handleTriggerAiWhatsapp = () => {
        const costValue = Number(data.estimated_cost);
        
        if (!costValue || costValue <= 0) {
            toast.error('Nominal estimasi biaya harus diisi sebelum mengirim penawaran.');
            return;
        }

        toast.loading('Menyimpan data dan memicu gateway WhatsApp...');

        router.put(`/services/${service.id}`, {
            status: data.status,
            estimated_cost: costValue,
            technician_notes: data.technician_notes,
            is_full_update: false,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                router.post(`/services/${service.id}/trigger-wa`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.dismiss();
                        toast.success('Pesan penawaran WA berhasil dipicu.');
                        onClose();
                    },
                    onError: () => {
                        toast.dismiss();
                        toast.error('Gagal memicu pengiriman pesan WhatsApp.');
                    }
                });
            },
            onError: () => {
                toast.dismiss();
                toast.error('Gagal menyimpan pembaruan biaya.');
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[95vh] overflow-y-auto rounded-xl border border-slate-200 p-6 shadow-lg">
                <form onSubmit={handleSubmitUpdate} className="space-y-6">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-blue-600" /> Proses Operasional Nota
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 mt-1">
                            Perbarui status perbaikan Nota <span className="font-bold text-blue-600 font-mono text-sm">{service.order_number}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Status Kerja Saat Ini</Label>
                            <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                <SelectTrigger className="h-10 border-slate-200 focus:ring-primary">
                                    <SelectValue placeholder="Pilih status terbaru..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="waiting_checking">Menunggu Dicek</SelectItem>
                                    <SelectItem value="waiting_approval">Menunggu Konfirmasi</SelectItem>
                                    <SelectItem value="approved">Disetujui Pelanggan</SelectItem> 
                                    <SelectItem value="in_progress">Sedang Diperbaiki</SelectItem>
                                    <SelectItem value="completed">Selesai (Siap Diambil)</SelectItem>
                                    <SelectItem value="taken">Sudah Diambil</SelectItem>
                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Estimasi / Total Biaya (Rp)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">Rp</span>
                                <Input
                                    type="number" min="0"
                                    className="pl-9 h-10 border-slate-200 focus-visible:ring-primary font-medium text-slate-800"
                                    value={data.estimated_cost}
                                    onChange={(e) => setData('estimated_cost', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                <FileText className="h-4 w-4 text-slate-400" /> Catatan Teknisi
                            </Label>
                            <Textarea
                                className="h-24 resize-none border-slate-200 focus-visible:ring-primary text-sm p-3"
                                value={data.technician_notes}
                                onChange={(e) => setData('technician_notes', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t -mx-6 -mb-6 bg-slate-50 rounded-b-xl px-6 py-4 mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 font-bold text-xs gap-1.5 h-10 shadow-sm"
                            disabled={processing || Number(data.estimated_cost) <= 0}
                            onClick={handleTriggerAiWhatsapp}
                        >
                            <Send className="h-3.5 w-3.5" /> Kirim Penawaran WA
                        </Button>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <Button type="button" variant="ghost" className="text-slate-500 font-semibold text-xs" onClick={onClose} disabled={processing}>
                                Batal
                            </Button>
                            <Button type="submit" className="w-full sm:w-auto min-w-[110px] font-bold text-xs gap-1.5 h-10 shadow-sm" disabled={processing}>
                                {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Simpan
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}