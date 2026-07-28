import { useForm } from '@inertiajs/react';
import { AlertCircle, Loader2, Search, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatNumberWithDots, getCleanNumber } from '@/utils/currency';
import { formatIndonesianPhone } from '@/lib/utils';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Customer } from '@/types/service';

const COMMON_BRANDS = ['Asus', 'Acer', 'Lenovo', 'HP', 'Dell', 'Apple', 'MSI', 'Axioo', 'Zyrex'];
const COMMON_DEVICE_TYPES = ['Laptop', 'PC Desktop', 'Printer', 'Proyektor', 'All-in-One PC'];
const COMMON_EQUIPMENTS = ['Charger', 'Tas', 'Mouse', 'Keyboard', 'Box'];

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function ServiceFormModal({ isOpen, onClose }: Props) {
    const [suggestions, setSuggestions] = useState<Customer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // State untuk UI Helper
    const [displayEstimatedCost, setDisplayEstimatedCost] = useState('');
    const [displayDownPayment, setDisplayDownPayment] = useState('');
    const [isIndentCase, setIsIndentCase] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        phone: '',
        name: '',
        customer_id: '',
        device_id: '',
        device_type: 'Laptop',
        brand: '',
        model: '',
        complaint: '',
        equipments: [] as string[],
        is_technician_on_site: false,
        is_unit_left_at_store: true, 
        estimated_cost: '',
        down_payment: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            setSelectedCustomer(null);
            setSuggestions([]);
            setDisplayEstimatedCost('');
            setDisplayDownPayment('');
            setIsIndentCase(false);
            clearErrors();
        }
    }, [isOpen]);

    // --- HELPER FORMAT RUPIAH ---
    const formatNumberWithDots = (value: string) => {
        const clean = value.replace(/\D/g, '');
        if (!clean) return '';
        return new Intl.NumberFormat('id-ID').format(Number(clean));
    };

    const getCleanNumber = (value: string) => value.replace(/\D/g, '');

    const handleEstimatedCostChange = (val: string) => {
        setDisplayEstimatedCost(formatNumberWithDots(val));
        setData('estimated_cost', getCleanNumber(val));
    };

    const handleDownPaymentChange = (val: string) => {
        setDisplayDownPayment(formatNumberWithDots(val));
        setData('down_payment', getCleanNumber(val));
    };
    // ----------------------------

    const handlePhoneChange = (val: string) => {
        // Otomatis format nomor HP jadi +62 8XX-XXXX-XXXX
        const displayVal = formatIndonesianPhone(val);
        setData('phone', displayVal);

        // Bersihkan hanya untuk API pencarian
        let numericVal = displayVal.replace(/\D/g, '');
        if (numericVal.startsWith('0')) numericVal = '62' + numericVal.substring(1);
        else if (numericVal.startsWith('8') && numericVal.length >= 1) numericVal = '62' + numericVal;

        if (selectedCustomer) {
            setSelectedCustomer(null);
            setData('customer_id', '');
            setData('name', '');
            setData('device_id', '');
        }

        if (numericVal.length >= 4) {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
            setIsSearching(true);
            searchTimeout.current = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/search-customer?phone=${numericVal}`);
                    if (!res.ok) throw new Error('Network error');
                    setSuggestions(await res.json());
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsSearching(false);
                }
            }, 400);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setSuggestions([]);
        setData((prev) => ({ ...prev, phone: customer.phone, name: customer.name, customer_id: customer.id.toString(), device_id: '' }));
    };

    const handleEquipmentToggle = (item: string) => {
        const current = [...data.equipments];
        if (current.includes(item)) setData('equipments', current.filter((i) => i !== item));
        else setData('equipments', [...current, item]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // VALIDASI KHUSUS: Jika inden dan unit tidak ditinggal di toko, WAJIB DP
        if (data.is_technician_on_site && isIndentCase && !data.is_unit_left_at_store) {
            const dp = Number(data.down_payment || 0);
            if (dp <= 0) {
                toast.error('Gagal: Wajib mengisi DP jika unit dibawa pulang pelanggan selama masa inden!');
                return;
            }
        }

        // Bersihkan format nomor WA sebelum dikirim ke backend
        let finalPhone = data.phone.replace(/\D/g, '');
        if (finalPhone.startsWith('0')) finalPhone = '62' + finalPhone.substring(1);
        else if (finalPhone.startsWith('8') && finalPhone.length >= 1) finalPhone = '62' + finalPhone;

        // Menggunakan transform untuk mengubah data tepat sebelum dikirim ke backend
        transform((currentData) => ({
            ...currentData,
            phone: finalPhone,
            estimated_cost: currentData.is_technician_on_site ? (currentData.estimated_cost || 0) : 0,
            down_payment: currentData.is_technician_on_site ? (currentData.down_payment || 0) : 0,
            is_unit_left_at_store: (currentData.is_technician_on_site && isIndentCase) ? currentData.is_unit_left_at_store : true,
        }));

        post('/services', {
            preserveScroll: true,
            onSuccess: () => {
                // RESET FORM AGAR TIDAK NYANGKUT SAAT DIBUKA LAGI
                reset();
                setDisplayEstimatedCost('');
                setDisplayDownPayment('');
                setIsIndentCase(false);
                setSelectedCustomer(null);
                setSuggestions([]);
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[95vh] flex-col overflow-hidden rounded-xl border-border p-0 shadow-xl sm:max-w-[850px]">
                <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
                    {/* Header Formal */}
                    <div className="shrink-0 flex items-center gap-3 border-b border-border bg-muted/20 p-4">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <DialogHeader className="text-left space-y-0 text-left sm:text-left">
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Registrasi Penerimaan Servis
                            </DialogTitle>
                            <DialogDescription className="text-[11px] mt-0.5">
                                Sistem akan mendeteksi otomatis data pelanggan terdaftar.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive" className="mb-6 py-3 border-red-500/50 bg-red-50 dark:bg-red-950/20">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs font-semibold">Terdapat kesalahan format data. Silakan periksa kolom yang ditandai merah.</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* KOLOM KIRI (PELANGGAN & PERANGKAT) */}
                            <div className="space-y-8">
                                {/* Panel Pelanggan */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">Informasi Pelanggan</h3>
                                    
                                    <div className="relative space-y-2">
                                        <Label htmlFor="phone" className={errors.phone ? 'text-destructive font-semibold' : 'text-slate-600 dark:text-slate-400 font-semibold'}>
                                            No. WhatsApp <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                                            <Input id="phone" type="tel" placeholder="Contoh: 081234..." className={`bg-background pl-9 transition-colors ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : 'border-slate-300 dark:border-slate-700'}`} value={data.phone} onChange={(e) => handlePhoneChange(e.target.value)} autoComplete="off" />
                                            {isSearching && <Loader2 className="absolute top-2.5 right-3 h-4 w-4 animate-spin text-slate-400" />}
                                        </div>
                                        {errors.phone && <p className="text-xs font-medium text-destructive">{errors.phone}</p>}
                                        
                                        {suggestions.length > 0 && !selectedCustomer && (
                                            <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-popover shadow-lg">
                                                <div className="bg-slate-100 dark:bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Hasil Pencarian ({suggestions.length})</div>
                                                {suggestions.map((cust) => (
                                                    <button key={cust.id} type="button" className="w-full border-b border-slate-100 dark:border-slate-800 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 focus:bg-slate-50 transition-colors" onClick={() => handleSelectCustomer(cust)}>
                                                        <div className="text-sm font-semibold text-foreground">{cust.name}</div>
                                                        <div className="mt-0.5 font-mono text-xs text-slate-500">{cust.phone}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name" className={errors.name ? 'text-destructive font-semibold' : 'text-slate-600 dark:text-slate-400 font-semibold'}>
                                            Nama Lengkap <span className="text-destructive">*</span>
                                        </Label>
                                        <Input id="name" placeholder="Sesuai identitas" value={data.name} onChange={(e) => setData('name', e.target.value)} readOnly={!!selectedCustomer} className={selectedCustomer ? 'cursor-not-allowed bg-slate-100 dark:bg-slate-900 text-slate-500' : errors.name ? 'border-destructive' : 'border-slate-300 dark:border-slate-700'} />
                                        {selectedCustomer && <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500 mt-1">✓ Memuat data pelanggan terdaftar.</p>}
                                        {errors.name && <p className="text-xs font-medium text-destructive mt-1">{errors.name}</p>}
                                    </div>
                                </div>

                                {/* Panel Perangkat */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">Spesifikasi Perangkat</h3>
                                    
                                    {selectedCustomer && selectedCustomer.devices && selectedCustomer.devices.length > 0 && (
                                        <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Riwayat Perangkat Pelanggan</Label>
                                            <Select value={data.device_id} onValueChange={(val) => setData('device_id', val)}>
                                                <SelectTrigger className="bg-background"><SelectValue placeholder="Daftarkan Perangkat Baru" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="new_device" className="font-semibold text-blue-600">Daftarkan Perangkat Baru</SelectItem>
                                                    {selectedCustomer.devices.map((dev) => (
                                                        <SelectItem key={dev.id} value={dev.id.toString()}>{dev.brand} {dev.model}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    
                                    {(!data.device_id || data.device_id === 'new_device') && (
                                        <div className="animate-in space-y-4 fade-in duration-300">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="device_type" className="text-slate-600 dark:text-slate-400 font-semibold">Kategori</Label>
                                                    <Input id="device_type" list="device-types" placeholder="Laptop / PC" className="bg-background border-slate-300 dark:border-slate-700" value={data.device_type} onChange={(e) => setData('device_type', e.target.value)} />
                                                    <datalist id="device-types">{COMMON_DEVICE_TYPES.map((type) => <option key={type} value={type} />)}</datalist>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="brand" className="text-slate-600 dark:text-slate-400 font-semibold">Merek</Label>
                                                    <Input id="brand" list="brands" placeholder="Cth: Asus" className="bg-background border-slate-300 dark:border-slate-700" value={data.brand} onChange={(e) => setData('brand', e.target.value)} />
                                                    <datalist id="brands">{COMMON_BRANDS.map((brand) => <option key={brand} value={brand} />)}</datalist>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="model" className="text-slate-600 dark:text-slate-400 font-semibold">Tipe/Seri Model (Opsional)</Label>
                                                <Input id="model" placeholder="Cth: ROG Strix G15" className="bg-background border-slate-300 dark:border-slate-700" value={data.model} onChange={(e) => setData('model', e.target.value)} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* KOLOM KANAN (KELUHAN & KEUANGAN) */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">Detail Servis</h3>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="complaint" className={errors.complaint ? 'font-semibold text-destructive' : 'font-semibold text-slate-600 dark:text-slate-400'}>
                                            Deskripsi Keluhan <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea id="complaint" placeholder="Jelaskan kendala secara spesifik..." className={`h-[100px] resize-none bg-background transition-colors ${errors.complaint ? 'border-destructive focus-visible:ring-destructive' : 'border-slate-300 dark:border-slate-700'}`} value={data.complaint} onChange={(e) => setData('complaint', e.target.value)} />
                                        {errors.complaint && <p className="text-xs font-medium text-destructive mt-1">{errors.complaint}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="font-semibold text-slate-600 dark:text-slate-400">Kelengkapan Unit (Diterima Toko)</Label>
                                        <div className="flex flex-wrap gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                            {COMMON_EQUIPMENTS.map((item) => (
                                                <div key={item} className="flex items-center space-x-2">
                                                    <Checkbox id={`eq-${item}`} checked={data.equipments.includes(item)} onCheckedChange={() => handleEquipmentToggle(item)} />
                                                    <label htmlFor={`eq-${item}`} className="cursor-pointer text-sm text-slate-700 dark:text-slate-300">{item}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* AREA OPERASIONAL & KEUANGAN */}
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">Persetujuan & Biaya</h3>
                                    
                                    <div className="flex items-start space-x-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-background transition-all">
                                        <Checkbox
                                            id="is_technician_on_site"
                                            checked={data.is_technician_on_site}
                                            onCheckedChange={(checked) => setData('is_technician_on_site', checked as boolean)}
                                            className="mt-0.5 h-5 w-5 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                        <div className="space-y-1 cursor-pointer" onClick={() => setData('is_technician_on_site', !data.is_technician_on_site)}>
                                            <label className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-slate-100">Pengecekan Langsung & Kesepakatan</label>
                                            <p className="text-xs text-slate-500 leading-relaxed">Pilih opsi ini jika estimasi perbaikan dan harga langsung disetujui bersama pelanggan saat registrasi.</p>
                                        </div>
                                    </div>

                                    {data.is_technician_on_site && (
                                        <div className="animate-in fade-in slide-in-from-top-2 p-5 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10 space-y-6">
                                            <div className="grid grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <Label htmlFor="estimated_cost" className="text-xs font-semibold text-slate-600 dark:text-slate-400">Estimasi Biaya (Rp)</Label>
                                                    <div className="relative">
                                                        <span className="absolute top-2.5 left-3 text-xs font-semibold text-slate-400">Rp</span>
                                                        <Input id="estimated_cost" type="text" placeholder="0" className="bg-background pl-9 font-mono font-medium border-slate-300 shadow-sm" value={displayEstimatedCost} onChange={(e) => handleEstimatedCostChange(e.target.value)} />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center h-4">
                                                        <Label htmlFor="down_payment" className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pembayaran Awal / DP</Label>
                                                        {Number(data.estimated_cost || 0) > 0 && Number(data.down_payment || 0) >= Number(data.estimated_cost || 0) && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 tracking-wider">
                                                                LUNAS
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute top-2.5 left-3 text-xs font-semibold text-slate-400">Rp</span>
                                                        <Input 
                                                            id="down_payment" type="text" placeholder="0" 
                                                            className={`bg-background pl-9 font-mono font-medium shadow-sm transition-colors ${Number(data.estimated_cost || 0) > 0 && Number(data.down_payment || 0) >= Number(data.estimated_cost || 0) ? 'border-emerald-500 focus-visible:ring-emerald-500' : 'border-slate-300'}`} 
                                                            value={displayDownPayment} onChange={(e) => handleDownPaymentChange(e.target.value)} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                                <div className="flex items-start space-x-3">
                                                    <Checkbox
                                                        id="is_indent_case"
                                                        checked={isIndentCase}
                                                        onCheckedChange={(checked) => {
                                                            setIsIndentCase(checked as boolean);
                                                            if (!checked) setData('is_unit_left_at_store', true); 
                                                        }}
                                                        className="mt-0.5 rounded"
                                                    />
                                                    <div className="space-y-1 cursor-pointer" onClick={() => {
                                                        setIsIndentCase(!isIndentCase);
                                                        if (isIndentCase) setData('is_unit_left_at_store', true);
                                                    }}>
                                                        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Membutuhkan Suku Cadang Pre-Order (Inden)</label>
                                                        <p className="text-xs text-slate-500">Pilih jika perbaikan harus menunggu ketersediaan barang.</p>
                                                    </div>
                                                </div>

                                                {isIndentCase && (
                                                    <div className="flex items-start space-x-3 p-4 rounded-md bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 animate-in fade-in duration-200">
                                                        <Checkbox
                                                            id="take_home"
                                                            checked={!data.is_unit_left_at_store}
                                                            onCheckedChange={(checked) => setData('is_unit_left_at_store', !checked)}
                                                            className="mt-0.5 rounded data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                                                        />
                                                        <div className="space-y-1 cursor-pointer" onClick={() => setData('is_unit_left_at_store', !data.is_unit_left_at_store)}>
                                                            <label className="text-sm font-semibold text-orange-800 dark:text-orange-400">Unit Tidak Ditinggal di Toko</label>
                                                            <p className="text-xs text-orange-700/70 dark:text-orange-300/70 leading-relaxed">
                                                                Berikan centang jika pelanggan memilih membawa pulang perangkatnya sementara suku cadang sedang dalam proses pengiriman.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Dialog */}
                    <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-muted/20 p-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing} className="min-w-[100px] h-9 text-xs border-slate-300">
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="min-w-[160px] h-9 text-xs font-semibold tracking-wide shadow-sm">
                            {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : 'Simpan Transaksi'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
