import { useForm } from '@inertiajs/react';
import { AlertCircle, Laptop, Loader2, Search, UserCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Customer } from '@/types/service';

const COMMON_BRANDS = [
    'Asus',
    'Acer',
    'Lenovo',
    'HP',
    'Dell',
    'Apple',
    'MSI',
    'Axioo',
    'Zyrex',
];
const COMMON_DEVICE_TYPES = [
    'Laptop',
    'PC Desktop',
    'Printer',
    'Proyektor',
    'All-in-One PC',
];
const COMMON_EQUIPMENTS = ['Charger', 'Tas', 'Mouse', 'Keyboard', 'Box'];

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function ServiceFormModal({ isOpen, onClose }: Props) {
    const [suggestions, setSuggestions] = useState<Customer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null,
    );
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
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
            estimated_cost: '',
            down_payment: '',
        });

    useEffect(() => {
        if (isOpen) {
            reset();
            setSelectedCustomer(null);
            setSuggestions([]);
            clearErrors();
        }
    }, [isOpen]);

    const handlePhoneChange = (val: string) => {
        let numericVal = val.replace(/\D/g, '');

        if (numericVal.startsWith('0')) {
            numericVal = '62' + numericVal.substring(1);
        } else if (numericVal.startsWith('8') && numericVal.length >= 1) {
            numericVal = '62' + numericVal;
        }

        setData('phone', numericVal);

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
                    const res = await fetch(
                        `/api/search-customer?phone=${numericVal}`,
                    );
                    if (!res.ok) throw new Error('Network response was not ok');

                    const json = await res.json();
                    setSuggestions(json);
                } catch (e) {
                    console.error('Gagal mengambil data pelanggan', e);
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
        setData((prev) => ({
            ...prev,
            phone: customer.phone,
            name: customer.name,
            customer_id: customer.id.toString(),
            device_id: '',
        }));
    };

    const handleEquipmentToggle = (item: string) => {
        const current = [...data.equipments];
        if (current.includes(item)) {
            setData(
                'equipments',
                current.filter((i) => i !== item),
            );
        } else {
            setData('equipments', [...current, item]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/services', {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError: () =>
                toast.error(
                    'Validasi gagal! Periksa kembali isian yang berwarna merah.',
                ),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Mengunci tinggi maksimal dan mengatur struktur Flex Column */}
            <DialogContent className="flex max-h-[95vh] flex-col overflow-hidden rounded-xl border-border p-0 shadow-2xl sm:max-w-[850px]">
                <form
                    onSubmit={handleSubmit}
                    className="flex h-full flex-col overflow-hidden"
                >
                    {/* Header Terkunci */}
                    <div className="shrink-0 border-b border-border bg-muted/20 p-5">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-foreground">
                                Terima Servisan Baru
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Sistem otomatis menyesuaikan nomor menjadi
                                format +62 dan mendeteksi pelanggan lama.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* Area Input (Bisa di-scroll mandiri) */}
                    <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive" className="mb-5 py-3">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs font-medium">
                                    Terdapat kesalahan input. Silakan periksa
                                    kolom yang ditandai merah.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* KOLOM KIRI: ENTITAS PELANGGAN & PERANGKAT */}
                            <div className="space-y-6">
                                {/* Panel Pelanggan */}
                                <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <UserCheck className="h-4 w-4 text-primary" />{' '}
                                        Data Pelanggan
                                    </h3>

                                    <div className="relative space-y-1.5">
                                        <Label
                                            htmlFor="phone"
                                            className={
                                                errors.phone
                                                    ? 'text-destructive'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            Nomor WhatsApp{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <div className="relative">
                                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="Contoh: 081234..."
                                                className={`bg-background pl-9 ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
                                                value={data.phone}
                                                onChange={(e) =>
                                                    handlePhoneChange(
                                                        e.target.value,
                                                    )
                                                }
                                                autoComplete="off"
                                            />
                                            {isSearching && (
                                                <Loader2 className="absolute top-2.5 right-3 h-4 w-4 animate-spin text-muted-foreground" />
                                            )}
                                        </div>
                                        {errors.phone && (
                                            <p className="text-xs font-medium text-destructive">
                                                {errors.phone}
                                            </p>
                                        )}

                                        {/* Dropdown Suggestions */}
                                        {suggestions.length > 0 &&
                                            !selectedCustomer && (
                                                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
                                                    <div className="border-b border-border bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
                                                        Ditemukan{' '}
                                                        {suggestions.length}{' '}
                                                        Pelanggan
                                                    </div>
                                                    {suggestions.map((cust) => (
                                                        <button
                                                            key={cust.id}
                                                            type="button"
                                                            className="w-full border-b border-border px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-accent focus:bg-accent"
                                                            onClick={() =>
                                                                handleSelectCustomer(
                                                                    cust,
                                                                )
                                                            }
                                                        >
                                                            <div className="text-sm font-semibold text-foreground">
                                                                {cust.name}
                                                            </div>
                                                            <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                                {cust.phone}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="name"
                                            className={
                                                errors.name
                                                    ? 'text-destructive'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            Nama Pelanggan{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="name"
                                            placeholder="Nama Lengkap"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            readOnly={!!selectedCustomer}
                                            className={
                                                selectedCustomer
                                                    ? 'cursor-not-allowed bg-muted font-medium text-muted-foreground'
                                                    : errors.name
                                                      ? 'border-destructive bg-background'
                                                      : 'bg-background'
                                            }
                                        />
                                        {selectedCustomer && (
                                            <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-500">
                                                Pelanggan lama
                                                teridentifikasi.
                                            </p>
                                        )}
                                        {errors.name && (
                                            <p className="text-xs font-medium text-destructive">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Panel Perangkat */}
                                <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <Laptop className="h-4 w-4 text-primary" />{' '}
                                        Data Perangkat
                                    </h3>

                                    {selectedCustomer &&
                                        selectedCustomer.devices &&
                                        selectedCustomer.devices.length > 0 && (
                                            <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                                                <Label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                                    Pilih dari riwayat perangkat
                                                </Label>
                                                <Select
                                                    value={data.device_id}
                                                    onValueChange={(val) =>
                                                        setData(
                                                            'device_id',
                                                            val,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue placeholder="Daftarkan Perangkat Baru" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="new_device"
                                                            className="font-bold text-primary"
                                                        >
                                                            Daftarkan Perangkat Baru
                                                        </SelectItem>
                                                        {selectedCustomer.devices.map(
                                                            (dev) => (
                                                                <SelectItem
                                                                    key={dev.id}
                                                                    value={dev.id.toString()}
                                                                >
                                                                    {dev.brand}{' '}
                                                                    {dev.model}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                    {(!data.device_id ||
                                        data.device_id === 'new_device') && (
                                        <div className="animate-in space-y-4 fade-in">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label
                                                        htmlFor="device_type"
                                                        className="text-muted-foreground"
                                                    >
                                                        Jenis
                                                    </Label>
                                                    <Input
                                                        id="device_type"
                                                        list="device-types"
                                                        placeholder="Cth: Laptop"
                                                        className="bg-background"
                                                        value={data.device_type}
                                                        onChange={(e) =>
                                                            setData(
                                                                'device_type',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <datalist id="device-types">
                                                        {COMMON_DEVICE_TYPES.map(
                                                            (type) => (
                                                                <option
                                                                    key={type}
                                                                    value={type}
                                                                />
                                                            ),
                                                        )}
                                                    </datalist>
                                                    {errors.device_type && (
                                                        <p className="text-xs font-medium text-destructive">
                                                            {errors.device_type}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label
                                                        htmlFor="brand"
                                                        className="text-muted-foreground"
                                                    >
                                                        Merek
                                                    </Label>
                                                    <Input
                                                        id="brand"
                                                        list="brands"
                                                        placeholder="Cth: Asus"
                                                        className="bg-background"
                                                        value={data.brand}
                                                        onChange={(e) =>
                                                            setData(
                                                                'brand',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <datalist id="brands">
                                                        {COMMON_BRANDS.map(
                                                            (brand) => (
                                                                <option
                                                                    key={brand}
                                                                    value={
                                                                        brand
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </datalist>
                                                    {errors.brand && (
                                                        <p className="text-xs font-medium text-destructive">
                                                            {errors.brand}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="model"
                                                    className="text-muted-foreground"
                                                >
                                                    Tipe/Model (Opsional)
                                                </Label>
                                                <Input
                                                    id="model"
                                                    placeholder="Cth: ROG Strix G15"
                                                    className="bg-background"
                                                    value={data.model}
                                                    onChange={(e) =>
                                                        setData(
                                                            'model',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.model && (
                                                    <p className="text-xs font-medium text-destructive">
                                                        {errors.model}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* KOLOM KANAN: KELUHAN & TAGIHAN */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="complaint"
                                        className={
                                            errors.complaint
                                                ? 'font-semibold text-destructive'
                                                : 'font-semibold'
                                        }
                                    >
                                        Keluhan Kerusakan{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Textarea
                                        id="complaint"
                                        placeholder="Deskripsikan keluhan pelanggan atau kerusakan secara detail..."
                                        className={`h-[120px] resize-none bg-background ${errors.complaint ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                        value={data.complaint}
                                        onChange={(e) =>
                                            setData('complaint', e.target.value)
                                        }
                                    />
                                    {errors.complaint && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.complaint}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="font-semibold text-foreground">
                                        Kelengkapan Bawaan
                                    </Label>
                                    <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                                        {COMMON_EQUIPMENTS.map((item) => (
                                            <div
                                                key={item}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={`eq-${item}`}
                                                    checked={data.equipments.includes(
                                                        item,
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleEquipmentToggle(
                                                            item,
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor={`eq-${item}`}
                                                    className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                                >
                                                    {item}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-start space-x-3 rounded-xl border border-emerald-500/20 bg-emerald-50 p-4 transition-all dark:bg-emerald-950/20">
                                        <Checkbox
                                            id="is_technician_on_site"
                                            checked={data.is_technician_on_site}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_technician_on_site',
                                                    checked as boolean,
                                                )
                                            }
                                            className="mt-0.5 h-5 w-5 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-500 dark:data-[state=checked]:bg-emerald-500"
                                        />
                                        <div
                                            className="cursor-pointer space-y-1"
                                            onClick={() =>
                                                setData(
                                                    'is_technician_on_site',
                                                    !data.is_technician_on_site,
                                                )
                                            }
                                        >
                                            <label className="cursor-pointer text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                                Teknisi Ada & Langsung Dicek?
                                            </label>
                                            <p className="text-xs leading-relaxed font-medium text-emerald-700 dark:text-emerald-400/80">
                                                Centang opsi ini jika kerusakan
                                                ringan dan harga kesepakatan
                                                sudah ditentukan langsung di
                                                tempat tanpa perlu proses
                                                konfirmasi WA.
                                            </p>
                                        </div>
                                    </div>

                                    {data.is_technician_on_site && (
                                        <div className="mt-4 grid animate-in grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 shadow-sm fade-in slide-in-from-top-2">
                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="estimated_cost"
                                                    className="text-xs text-muted-foreground"
                                                >
                                                    Estimasi Biaya (Rp)
                                                </Label>
                                                <Input
                                                    id="estimated_cost"
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    className="bg-background font-mono"
                                                    value={data.estimated_cost}
                                                    onChange={(e) =>
                                                        setData(
                                                            'estimated_cost',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.estimated_cost && (
                                                    <p className="text-xs font-medium text-destructive">
                                                        {errors.estimated_cost}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="down_payment"
                                                    className="text-xs text-muted-foreground"
                                                >
                                                    Uang Muka/DP (Rp)
                                                </Label>
                                                <Input
                                                    id="down_payment"
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    className="bg-background font-mono"
                                                    value={data.down_payment}
                                                    onChange={(e) =>
                                                        setData(
                                                            'down_payment',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.down_payment && (
                                                    <p className="text-xs font-medium text-destructive">
                                                        {errors.down_payment}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Terkunci di Bawah */}
                    <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-muted/30 p-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="min-w-[160px] font-semibold"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan & Buat Nota'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
