import { useForm } from '@inertiajs/react';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Customer {
    id: number;
    name: string;
    phone: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function TradeInFormModal({ isOpen, onClose }: Props) {
    const [suggestions, setSuggestions] = useState<Customer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const [displayPurchasePrice, setDisplayPurchasePrice] = useState('');

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        phone: '',
        name: '',
        item_name: '',
        serial_number: '',
        specification_summary: '',
        condition_notes: '',
        purchase_price: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            setSelectedCustomer(null);
            setSuggestions([]);
            setDisplayPurchasePrice('');
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

    const handlePurchasePriceChange = (val: string) => {
        setDisplayPurchasePrice(formatNumberWithDots(val));
        setData('purchase_price', getCleanNumber(val));
    };
    // ----------------------------

    const handlePhoneChange = (val: string) => {
        let numericVal = val.replace(/\D/g, '');
        if (numericVal.startsWith('0')) numericVal = '62' + numericVal.substring(1);
        else if (numericVal.startsWith('8') && numericVal.length >= 1) numericVal = '62' + numericVal;

        setData('phone', numericVal);

        if (selectedCustomer) {
            setSelectedCustomer(null);
            setData('name', '');
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
        setData((prev) => ({ ...prev, phone: customer.phone, name: customer.name }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Menggunakan transform untuk memastikan purchase_price adalah angka sebelum dikirim
        transform((currentData) => ({
            ...currentData,
            purchase_price: currentData.purchase_price ? Number(currentData.purchase_price) : 0,
        }));

        post('/sales/trade-in', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setDisplayPurchasePrice('');
                setSelectedCustomer(null);
                setSuggestions([]);
                onClose();
            },
            onError: () => toast.error('Registrasi gagal. Silakan periksa kembali kolom yang wajib diisi.'),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[95vh] flex-col overflow-hidden rounded-xl border-border p-0 shadow-xl sm:max-w-[850px]">
                <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
                    {/* Header Formal */}
                    <div className="shrink-0 border-b border-border bg-slate-50 dark:bg-slate-900/50 p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                Pencatatan Pembelian Barang Bekas
                            </DialogTitle>
                            <DialogDescription className="text-sm mt-1">
                                Sistem akan mendeteksi otomatis data pelanggan jika nomor telepon sudah terdaftar.
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
                            {/* KOLOM KIRI (PELANGGAN) */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">Informasi Pelanggan (Penjual)</h3>
                                    
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

                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">Kesepakatan Harga</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="purchase_price" className={errors.purchase_price ? 'text-destructive font-semibold' : 'text-slate-600 dark:text-slate-400 font-semibold'}>
                                            Harga Beli Disetujui (Rp) <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute top-2.5 left-3 text-xs font-semibold text-slate-400">Rp</span>
                                            <Input id="purchase_price" type="text" placeholder="0" className={`bg-background pl-9 font-mono font-medium shadow-sm transition-colors ${errors.purchase_price ? 'border-destructive focus-visible:ring-destructive' : 'border-slate-300 dark:border-slate-700'}`} value={displayPurchasePrice} onChange={(e) => handlePurchasePriceChange(e.target.value)} />
                                        </div>
                                        {errors.purchase_price && <p className="text-xs font-medium text-destructive mt-1">{errors.purchase_price}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* KOLOM KANAN (PERANGKAT) */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">Detail Perangkat</h3>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="item_name" className={errors.item_name ? 'font-semibold text-destructive' : 'font-semibold text-slate-600 dark:text-slate-400'}>
                                            Nama Perangkat / Merek <span className="text-destructive">*</span>
                                        </Label>
                                        <Input id="item_name" placeholder="Cth: Laptop Asus ROG Strix G15" className={`bg-background transition-colors ${errors.item_name ? 'border-destructive focus-visible:ring-destructive' : 'border-slate-300 dark:border-slate-700'}`} value={data.item_name} onChange={(e) => setData('item_name', e.target.value)} />
                                        {errors.item_name && <p className="text-xs font-medium text-destructive mt-1">{errors.item_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="serial_number" className={errors.serial_number ? 'font-semibold text-destructive' : 'font-semibold text-slate-600 dark:text-slate-400'}>
                                            Serial Number (Opsional)
                                        </Label>
                                        <Input id="serial_number" placeholder="SN/IMEI perangkat" className={`bg-background transition-colors ${errors.serial_number ? 'border-destructive focus-visible:ring-destructive' : 'border-slate-300 dark:border-slate-700'}`} value={data.serial_number} onChange={(e) => setData('serial_number', e.target.value)} />
                                        {errors.serial_number && <p className="text-xs font-medium text-destructive mt-1">{errors.serial_number}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="specification_summary" className={errors.specification_summary ? 'font-semibold text-destructive' : 'font-semibold text-slate-600 dark:text-slate-400'}>
                                            Ringkasan Spesifikasi <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea id="specification_summary" placeholder="Cth: Ryzen 7, RAM 16GB, SSD 512GB, RTX 3050" className={`h-[80px] resize-none bg-background transition-colors ${errors.specification_summary ? 'border-destructive focus-visible:ring-destructive' : 'border-slate-300 dark:border-slate-700'}`} value={data.specification_summary} onChange={(e) => setData('specification_summary', e.target.value)} />
                                        {errors.specification_summary && <p className="text-xs font-medium text-destructive mt-1">{errors.specification_summary}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="condition_notes" className={errors.condition_notes ? 'font-semibold text-destructive' : 'font-semibold text-slate-600 dark:text-slate-400'}>
                                            Kondisi & Kelengkapan <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea id="condition_notes" placeholder="Cth: Body mulus 90%, charger ori, ada tas, minus baterai bocor" className={`h-[80px] resize-none bg-background transition-colors ${errors.condition_notes ? 'border-destructive focus-visible:ring-destructive' : 'border-slate-300 dark:border-slate-700'}`} value={data.condition_notes} onChange={(e) => setData('condition_notes', e.target.value)} />
                                        {errors.condition_notes && <p className="text-xs font-medium text-destructive mt-1">{errors.condition_notes}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Dialog */}
                    <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-slate-50 dark:bg-slate-900/50 p-5">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing} className="min-w-[100px] border-slate-300">
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="min-w-[160px] font-semibold tracking-wide">
                            {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : 'Simpan Transaksi'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
