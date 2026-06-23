import { useForm } from '@inertiajs/react';
import { Loader2, MessageSquare, Save, Info, Laptop, User } from 'lucide-react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ServiceListItem } from '@/types/service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceListItem | null;
}

export function ServiceDetailSheet({ isOpen, onClose, service }: Props) {
    const updateForm = useForm({
        status: '',
        estimated_cost: '',
        technician_notes: '',
    });

    const waForm = useForm({});

    useEffect(() => {
        if (service && isOpen) {
            updateForm.setData({
                status: service.status,
                estimated_cost: service.estimated_cost?.toString() || '',
                technician_notes: '', // Idealnya dari relasi DB, untuk sekarang kosong
            });
            updateForm.clearErrors();
        }
    }, [service, isOpen]);

    if (!service) return null;

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateForm.patch(`/services/${service.id}`, {
            preserveScroll: true,
            onSuccess: () => onClose(), // Tutup otomatis jika sukses
        });
    };

    const handleTriggerWa = () => {
        waForm.post(`/services/${service.id}/trigger-wa`, {
            preserveScroll: true,
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full overflow-y-auto bg-slate-50 p-0 sm:max-w-md md:max-w-lg">
                <div className="sticky top-0 z-10 border-b bg-white p-6 shadow-sm">
                    <SheetHeader>
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-2xl font-bold text-primary">
                                {service.order_number}
                            </SheetTitle>
                            <Badge variant="outline" className="bg-slate-50">
                                {service.status_label}
                            </Badge>
                        </div>
                        <SheetDescription>
                            Didaftarkan pada {service.created_at}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="p-6">
                    <Tabs defaultValue="operational" className="w-full">
                        <TabsList className="mb-6 grid w-full grid-cols-2">
                            <TabsTrigger value="operational">
                                Diagnosa Teknisi
                            </TabsTrigger>
                            <TabsTrigger
                                value="ai_logs"
                                className="text-emerald-700 data-[state=active]:bg-emerald-100"
                            >
                                AI & Otomatisasi
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="operational" className="space-y-6">
                            {/* Read-Only Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border bg-white p-4 shadow-sm">
                                    <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
                                        <User className="h-3.5 w-3.5" />{' '}
                                        Pelanggan
                                    </div>
                                    <div className="text-sm font-semibold text-slate-900">
                                        {service.customer_name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {service.customer_phone}
                                    </div>
                                </div>
                                <div className="rounded-xl border bg-white p-4 shadow-sm">
                                    <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
                                        <Laptop className="h-3.5 w-3.5" />{' '}
                                        Perangkat
                                    </div>
                                    <div className="text-sm leading-snug font-semibold text-slate-900">
                                        {service.device_name}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 rounded-xl border bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
                                    <Info className="h-3.5 w-3.5" /> Keluhan
                                    Awal
                                </div>
                                <p className="text-sm leading-relaxed text-slate-700">
                                    {service.complaint}
                                </p>
                            </div>

                            {/* Form Input Teknisi */}
                            <form
                                onSubmit={handleUpdate}
                                className="space-y-5 rounded-xl border bg-white p-5 shadow-sm"
                            >
                                <h4 className="border-b pb-2 font-bold text-slate-800">
                                    Tindakan & Update
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Ubah Status</Label>
                                        <Select
                                            value={updateForm.data.status}
                                            onValueChange={(v) =>
                                                updateForm.setData('status', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="waiting_checking">
                                                    Antrean Baru
                                                </SelectItem>
                                                <SelectItem value="waiting_approval">
                                                    Tunggu Konfirmasi
                                                </SelectItem>
                                                <SelectItem value="in_progress">
                                                    Sedang Dikerjakan
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                    Selesai
                                                </SelectItem>
                                                <SelectItem value="cancelled">
                                                    Batal
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {updateForm.errors.status && (
                                            <p className="text-xs text-destructive">
                                                {updateForm.errors.status}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Estimasi Biaya (Rp)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="Contoh: 450000"
                                            value={
                                                updateForm.data.estimated_cost
                                            }
                                            onChange={(e) =>
                                                updateForm.setData(
                                                    'estimated_cost',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {updateForm.errors.estimated_cost && (
                                            <p className="text-xs text-destructive">
                                                {
                                                    updateForm.errors
                                                        .estimated_cost
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Catatan Teknisi / Kerusakan Asli
                                    </Label>
                                    <Textarea
                                        placeholder="Tulis hasil bongkar..."
                                        className="h-24 resize-none"
                                        value={updateForm.data.technician_notes}
                                        onChange={(e) =>
                                            updateForm.setData(
                                                'technician_notes',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {updateForm.errors.technician_notes && (
                                        <p className="text-xs text-destructive">
                                            {updateForm.errors.technician_notes}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={updateForm.processing}
                                >
                                    {updateForm.processing ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Simpan & Perbarui Status
                                </Button>
                            </form>
                        </TabsContent>

                        {/* TAB JEMBATAN SKRIPSI (AI) */}
                        <TabsContent value="ai_logs" className="space-y-4">
                            <div className="space-y-4 rounded-xl border-2 border-emerald-100 bg-emerald-50 p-5">
                                <div className="space-y-2 text-center">
                                    <h3 className="text-lg font-bold text-emerald-900">
                                        Sistem AI & Gateway
                                    </h3>
                                    <p className="text-sm leading-relaxed text-emerald-700">
                                        Kirim rincian biaya ke WhatsApp
                                        pelanggan. Sistem AI NLP akan otomatis
                                        mendeteksi persetujuan dari balasan
                                        pelanggan.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    className="text-md h-12 w-full bg-emerald-600 shadow-md hover:bg-emerald-700"
                                    onClick={handleTriggerWa}
                                    disabled={waForm.processing}
                                >
                                    {waForm.processing ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                    )}
                                    Kirim WA & Standby AI
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}
