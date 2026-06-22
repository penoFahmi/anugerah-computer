import { useForm } from '@inertiajs/react';
import {
    Loader2,
    MessageSquare,
    Save,
    X,
    Info,
    Laptop,
    User,
} from 'lucide-react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { ServiceListItem } from '@/types/service';

interface Props {
    service: ServiceListItem;
    onClose: () => void;
}

export function ServiceDetailPanel({ service, onClose }: Props) {
    // Gunakan useForm bawaan Inertia agar terhubung langsung dengan sistem Flash Laravel
    const updateForm = useForm({
        status: service.status,
        estimated_cost: service.estimated_cost?.toString() || '',
        technician_notes: '',
    });

    const triggerWaForm = useForm({});

    // Reset data form jika kasir mengklik baris/nota yang berbeda di tabel
    useEffect(() => {
        updateForm.setData({
            status: service.status,
            estimated_cost: service.estimated_cost?.toString() || '',
            technician_notes: '',
        });
        updateForm.clearErrors();
    }, [service.id]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateForm.patch(`/services/${service.id}`, {
            preserveScroll: true,
        });
    };

    const handleTriggerWa = () => {
        triggerWaForm.post(`/services/${service.id}/trigger-wa`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* Header Panel */}
            <div className="flex items-center justify-between border-b bg-slate-50/50 p-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-primary">
                            {service.order_number}
                        </h3>
                        <Badge variant="outline" className="bg-white">
                            {service.status_label}
                        </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Didaftarkan: {service.created_at}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 text-slate-500 hover:text-destructive"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <Tabs
                defaultValue="operational"
                className="flex flex-1 flex-col overflow-hidden"
            >
                <TabsList className="grid h-12 w-full grid-cols-2 rounded-none border-b bg-transparent">
                    <TabsTrigger
                        value="operational"
                        className="rounded-none shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    >
                        Diagnosa Teknisi
                    </TabsTrigger>
                    <TabsTrigger
                        value="ai_logs"
                        className="rounded-none text-emerald-700 shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600"
                    >
                        AI & Skripsi
                    </TabsTrigger>
                </TabsList>

                {/* Konten Scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                    <TabsContent value="operational" className="mt-0 space-y-6">
                        {/* Info Read-Only */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border bg-slate-50 p-3">
                                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                                    <User className="h-3 w-3" /> Pelanggan
                                </div>
                                <div className="truncate text-sm font-semibold">
                                    {service.customer_name}
                                </div>
                            </div>
                            <div className="rounded-lg border bg-slate-50 p-3">
                                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                                    <Laptop className="h-3 w-3" /> Perangkat
                                </div>
                                <div className="truncate text-sm font-semibold">
                                    {service.device_name}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
                                <Info className="h-3.5 w-3.5" /> Keluhan Awal
                            </div>
                            <p className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
                                {service.complaint}
                            </p>
                        </div>

                        {/* Form Update Inertia */}
                        <form
                            onSubmit={handleUpdate}
                            className="space-y-4 border-t pt-4"
                        >
                            <h4 className="text-sm font-bold text-slate-800">
                                Tindakan Teknisi
                            </h4>

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
                                            Menunggu Dicek
                                        </SelectItem>
                                        <SelectItem value="waiting_approval">
                                            Tunggu Konfirmasi (WA)
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
                            </div>

                            <div className="space-y-2">
                                <Label>Estimasi Biaya Final (Rp)</Label>
                                <Input
                                    type="number"
                                    placeholder="Contoh: 450000"
                                    value={updateForm.data.estimated_cost}
                                    onChange={(e) =>
                                        updateForm.setData(
                                            'estimated_cost',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Catatan Teknisi (Kerusakan Asli)</Label>
                                <Textarea
                                    placeholder="Tulis hasil diagnosa..."
                                    className="h-20 resize-none"
                                    value={updateForm.data.technician_notes}
                                    onChange={(e) =>
                                        updateForm.setData(
                                            'technician_notes',
                                            e.target.value,
                                        )
                                    }
                                />
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
                                Simpan Operasional
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="ai_logs" className="mt-0 space-y-4">
                        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-emerald-900">
                                    Sistem Penawaran Otomatis
                                </h3>
                                <p className="text-xs leading-relaxed text-emerald-700">
                                    Jika biaya telah diisi, klik tombol di bawah
                                    untuk mengirim pesan WA. AI NLP/LLM akan
                                    otomatis mendeteksi niat balasan
                                    (Setuju/Batal) dan memindah status tanpa
                                    campur tangan admin.
                                </p>
                            </div>

                            <Button
                                type="button"
                                className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={handleTriggerWa}
                                disabled={triggerWaForm.processing}
                            >
                                {triggerWaForm.processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                )}
                                Kirim WA & Standby AI
                            </Button>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
