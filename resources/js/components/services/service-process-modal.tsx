import { useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Loader2, Wrench, DollarSign, FileText, Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ServiceListItem } from '@/types/service';

interface ServiceProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceListItem | null;
}

export function ServiceProcessModal({ isOpen, onClose, service }: ServiceProcessModalProps) {
    // 1. Inisialisasi Form Inertia untuk Update Data Operasional
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        status: '',
        estimated_cost: '',
        technician_notes: '',
    });

    // 2. Sinkronisasi Data saat Modal Dibuka atau Ganti Baris Servisan
    useEffect(() => {
        if (isOpen && service) {
            setData({
                status: service.status,
                // Hilangkan desimal .00 jika ada dari database agar nyaman dibaca di input
                estimated_cost: service.estimated_cost ? Math.round(Number(service.estimated_cost)).toString() : '',
                // Catatan teknisi tidak dikirim via list item di controller sebelumnya, kita set kosong atau nanti ter-update via get detail jika dikembangkan
                technician_notes: '', 
            });
            clearErrors();
        }
    }, [isOpen, service]);

    if (!service) return null;

    // 3. Handler Submit untuk Update Standar (Mengubah Status / Biaya / Catatan)
    const handleSubmitUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/services/${service.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Nota ${service.order_number} berhasil diperbarui.`);
                onClose();
            },
            onError: () => {
                toast.error('Gagal memperbarui data. Silakan periksa kembali isian Anda.');
            },
        });
    };

    // 4. Handler Khusus untuk Memicu Pengiriman WA Penawaran (Inti Skripsi AI)
    // Alur: Simpan perubahan biaya terlebih dahulu ke DB, baru tembak endpoint trigger WA Offer
    const handleTriggerAiWhatsapp = () => {
        const costValue = Number(data.estimated_cost);
        
        if (!costValue || costValue <= 0) {
            toast.error('Gagal: Nominal estimasi biaya harus diisi di atas Rp 0 sebelum memicu AI WhatsApp.');
            return;
        }

        toast.loading('Menyimpan biaya dan mengaktifkan agen AI WhatsApp...');

        // Langkah Awal: Amankan data biaya terbaru ke database terlebih dahulu
        router.put(`/services/${service.id}`, {
            status: data.status,
            estimated_cost: data.estimated_cost,
            technician_notes: data.technician_notes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Langkah Kedua: Jika sukses simpan, langsung panggil API trigger Whatsapp Offer
                router.post(`/services/${service.id}/trigger-wa-offer`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.dismiss();
                        toast.success('Penawaran terkirim! Gateway AI kini siaga membaca balasan pelanggan.');
                        onClose();
                    },
                    onError: () => {
                        toast.dismiss();
                        toast.error('Gagal memicu gateway WhatsApp. Periksa koneksi server/API.');
                    }
                });
            },
            onError: () => {
                toast.dismiss();
                toast.error('Gagal mengamankan data biaya baru ke database.');
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[95vh] overflow-y-auto rounded-xl border border-slate-200 p-6 shadow-lg">
                <form onSubmit={handleSubmitUpdate} className="space-y-6">
                    
                    {/* HEADER MODAL */}
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-blue-600" /> Proses Operasional Nota
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 mt-1">
                            Perbarui perkembangan unit perbaikan untuk Nota{' '}
                            <span className="font-bold text-blue-600 font-mono text-sm">{service.order_number}</span> ({service.device_name})
                        </DialogDescription>
                    </DialogHeader>

                    {/* KONTEN UTAMA FORM */}
                    <div className="space-y-5">
                        
                        {/* 1. SELEKSI STATUS OPERASIONAL */}
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-semibold text-slate-700">
                                Status Kerja Saat Ini
                            </Label>
                            <Select
                                value={data.status}
                                onValueChange={(val) => setData('status', val)}
                            >
                                <SelectTrigger id="status" className="h-10 border-slate-200 focus:ring-primary">
                                    <SelectValue placeholder="Pilih status terbaru..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="waiting_checking">🔴 Menunggu Dicek (Antrean Baru)</SelectItem>
                                    <SelectItem value="waiting_approval">🟠 Menunggu Konfirmasi (Tunggu Jawaban WA)</SelectItem>
                                    <SelectItem value="in_progress">🔵 Sedang Diperbaiki (Pengerjaan Teknisi)</SelectItem>
                                    <SelectItem value="completed">🟢 Selesai (Unit Bisa Diambil)</SelectItem>
                                    <SelectItem value="taken">🟢 Sudah Diambil (Pelunasan Selesai)</SelectItem>
                                    <SelectItem value="cancelled">⚫ Dibatalkan</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-xs text-destructive font-medium">{errors.status}</p>
                            )}
                        </div>

                        {/* 2. INPUT ESTIMASI BIAYA */}
                        <div className="space-y-2">
                            <Label htmlFor="estimated_cost" className="text-sm font-semibold text-slate-700">
                                Estimasi / Total Biaya Nyata (Rp)
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">Rp</span>
                                <Input
                                    id="estimated_cost"
                                    type="number"
                                    min="0"
                                    placeholder="Masukkan nominal biaya..."
                                    className="pl-9 h-10 border-slate-200 focus-visible:ring-primary font-medium text-slate-800"
                                    value={data.estimated_cost}
                                    onChange={(e) => setData('estimated_cost', e.target.value)}
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">
                                * Isi nominal riil hasil pembongkaran sebelum memicu pesan penawaran AI ke WhatsApp pelanggan.
                            </p>
                            {errors.estimated_cost && (
                                <p className="text-xs text-destructive font-medium">{errors.estimated_cost}</p>
                            )}
                        </div>

                        {/* 3. CATATAN INTERNAL TEKNISI */}
                        <div className="space-y-2">
                            <Label htmlFor="technician_notes" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                <FileText className="h-4 w-4 text-slate-400" /> Catatan Teknisi / Tindakan
                            </Label>
                            <Textarea
                                id="technician_notes"
                                placeholder="Tulis detail kerusakan, sparepart yang perlu diganti, atau riwayat pengecekan di sini..."
                                className="h-24 resize-none border-slate-200 focus-visible:ring-primary text-sm p-3"
                                value={data.technician_notes}
                                onChange={(e) => setData('technician_notes', e.target.value)}
                            />
                            {errors.technician_notes && (
                                <p className="text-xs text-destructive font-medium">{errors.technician_notes}</p>
                            )}
                        </div>

                    </div>

                    {/* FOOTER MODAL (TOMBOL AKSI) */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t -mx-6 -mb-6 bg-slate-50 rounded-b-xl px-6 py-4 mt-8">
                        
                        {/* SEBELAH KIRI: Tombol Utama Skripsi (Trigger AI WhatsApp) */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 font-bold text-xs gap-1.5 h-10 shadow-sm"
                            disabled={processing || Number(data.estimated_cost) <= 0}
                            onClick={handleTriggerAiWhatsapp}
                        >
                            <Send className="h-3.5 w-3.5" /> Kirim Penawaran WA (Picu AI)
                        </Button>

                        {/* SEBELAH KANAN: Batal & Simpan Standar */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-slate-500 font-semibold text-xs"
                                onClick={onClose}
                                disabled={processing}
                            >
                                Close
                            </Button>
                            
                            <Button
                                type="submit"
                                className="w-full sm:w-auto min-w-[110px] font-bold text-xs gap-1.5 h-10 shadow-sm"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-3.5 w-3.5" /> Simpan Perubahan
                                    </>
                                )}
                            </Button>
                        </div>

                    </div>

                </form>
            </DialogContent>
        </Dialog>
    );
}