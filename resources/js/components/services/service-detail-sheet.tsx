import { router } from '@inertiajs/react';
import { Loader2, MessageSquare, Save, User, Laptop, Info, Badge } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { ServiceListItem } from '@/types/service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceListItem | null;
}

export function ServiceDetailSheet({ isOpen, onClose, service }: Props) {
    const [isUpdating, setIsUpdating] = useState(false);

    // State lokal untuk form teknisi (akan disinkronkan dari Backend nanti)
    const [formData, setFormData] = useState({
        status: service?.status || '',
        estimated_cost: service?.estimated_cost || '',
        technician_notes: '',
    });

    if (!service) return null;

    const handleUpdate = () => {
        // Nanti kita buat rute update-nya di Controller
        toast.info(
            `Tombol Update diklik untuk nota ${service.order_number}. Endpoint Backend segera menyusul!`,
        );
    };

    const handleTriggerAI = () => {
        // Nanti ini memanggil Endpoint yang men-trigger WA Gateway + AI
        toast.success(
            `Mengirim penawaran WA ke ${service.customer_phone}. Sistem AI akan siaga menunggu balasan!`,
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full overflow-y-auto bg-slate-50 sm:max-w-md md:max-w-xl">
                <SheetHeader className="mb-6 border-b pb-4">
                    <SheetTitle className="flex items-center justify-between text-2xl font-bold text-primary">
                        {service.order_number}
                        <Badge variant="outline" className="bg-white text-sm">
                            {service.status_label}
                        </Badge>
                    </SheetTitle>
                    <SheetDescription>
                        Didaftarkan pada {service.created_at}
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="operational" className="w-full">
                    <TabsList className="mb-6 grid w-full grid-cols-2">
                        <TabsTrigger
                            value="operational"
                            className="font-semibold"
                        >
                            Operasional & Teknisi
                        </TabsTrigger>
                        <TabsTrigger
                            value="ai_logs"
                            className="font-semibold text-emerald-700 data-[state=active]:bg-emerald-100"
                        >
                            Log AI & WA
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: OPERASIONAL TEKNISI */}
                    <TabsContent value="operational" className="space-y-6">
                        {/* Info Pelanggan & Barang (Read Only) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border bg-white p-3 shadow-sm">
                                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                    <User className="h-3.5 w-3.5" /> Pelanggan
                                </div>
                                <div className="font-semibold text-slate-900">
                                    {service.customer_name}
                                </div>
                                <div className="text-sm text-slate-600">
                                    {service.customer_phone}
                                </div>
                            </div>
                            <div className="rounded-lg border bg-white p-3 shadow-sm">
                                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                    <Laptop className="h-3.5 w-3.5" /> Perangkat
                                </div>
                                <div className="font-semibold text-slate-900">
                                    {service.device_name}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-white p-3 shadow-sm">
                            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                <Info className="h-3.5 w-3.5" /> Keluhan Awal
                            </div>
                            <p className="text-sm leading-relaxed text-slate-700">
                                {service.complaint}
                            </p>
                        </div>

                        {/* Form Update Teknisi */}
                        <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
                            <h3 className="border-b pb-2 font-bold text-slate-800">
                                Diagnosa & Tindakan Teknisi
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Ubah Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                status: v,
                                            })
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
                                        defaultValue={service.estimated_cost}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                estimated_cost: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Catatan Teknisi (Kerusakan Asli)</Label>
                                <Textarea
                                    placeholder="Tulis hasil diagnosa teknisi di sini..."
                                    className="h-24 resize-none"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            technician_notes: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <Button className="w-full" onClick={handleUpdate}>
                                <Save className="mr-2 h-4 w-4" /> Simpan
                                Perubahan
                            </Button>
                        </div>
                    </TabsContent>

                    {/* TAB 2: AI & WHATSAPP LOGS (The Thesis Bridge) */}
                    <TabsContent value="ai_logs" className="space-y-4">
                        <div className="space-y-4 rounded-xl border-2 border-emerald-100 bg-emerald-50/50 p-5">
                            <div className="space-y-2 text-center">
                                <h3 className="font-bold text-emerald-900">
                                    Sistem Penawaran Otomatis (AI)
                                </h3>
                                <p className="text-xs text-emerald-700">
                                    Pastikan Harga Estimasi sudah diisi. Jika
                                    tombol di bawah ditekan, AI akan mengirim
                                    rincian biaya ke pelanggan dan menganalisa
                                    niat balasan mereka secara otomatis.
                                </p>
                            </div>

                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleTriggerAI}
                            >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Kirim Penawaran via WA & Aktifkan AI
                            </Button>
                        </div>

                        {/* Tempat Log Nanti */}
                        <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-400">
                            Menunggu riwayat chat dari Pelanggan...
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
