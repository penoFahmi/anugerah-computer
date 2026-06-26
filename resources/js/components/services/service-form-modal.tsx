import { useForm } from '@inertiajs/react';
import { Loader2, Search, UserCheck, Laptop, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Customer } from '@/types/service';

// Konstanta Master Data Ringan (Hanya untuk Auto-suggest UI)
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
        setData('phone', val);

        if (selectedCustomer) {
            setSelectedCustomer(null);
            setData('customer_id', '');
            setData('name', '');
            setData('device_id', '');
        }

        if (val.length >= 4) {
            if (searchTimeout.current) {
clearTimeout(searchTimeout.current);
}

            setIsSearching(true);
            searchTimeout.current = setTimeout(async () => {
                try {
                    const res = await fetch(
                        `/api/search-customer?phone=${val}`,
                    );

                    if (!res.ok) {
throw new Error('Network response was not ok');
}

                    const json = await res.json();
                    setSuggestions(json);
                } catch (e) {
                    console.error('Gagal mengambil data pelanggan', e);
                } finally {
                    setIsSearching(false);
                }
            }, 300);
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
            onSuccess: () => {
                onClose();
            },
            onError: () => {
                toast.error(
                    'Validasi gagal! Periksa kembali isian yang berwarna merah.',
                );
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[750px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl">
                            Terima Servisan Baru
                        </DialogTitle>
                        <DialogDescription>
                            Sistem akan otomatis membedakan pendaftaran
                            pelanggan baru dan lama berdasarkan Nomor WhatsApp.
                        </DialogDescription>
                    </DialogHeader>

                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Terdapat kesalahan input. Silakan periksa kolom
                                yang ditandai merah di bawah.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* KIRI: ENTITAS PELANGGAN & PERANGKAT */}
                        <div className="space-y-5">
                            {/* Panel Pelanggan */}
                            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                    <UserCheck className="h-4 w-4 text-primary" />{' '}
                                    Data Pelanggan
                                </h3>

                                <div className="relative space-y-2">
                                    <Label
                                        htmlFor="phone"
                                        className={
                                            errors.phone
                                                ? 'text-destructive'
                                                : ''
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
                                            placeholder="Contoh: 08123456789"
                                            className={`pl-9 ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
                                        <p className="text-xs text-destructive">
                                            {errors.phone}
                                        </p>
                                    )}

                                    {suggestions.length > 0 &&
                                        !selectedCustomer && (
                                            <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-lg">
                                                <div className="border-b bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                                                    Ditemukan{' '}
                                                    {suggestions.length}{' '}
                                                    Pelanggan
                                                </div>
                                                {suggestions.map((cust) => (
                                                    <button
                                                        key={cust.id}
                                                        type="button"
                                                        className="w-full border-b px-4 py-2 text-left text-sm transition-colors last:border-b-0 hover:bg-slate-50 focus:bg-slate-50"
                                                        onClick={() =>
                                                            handleSelectCustomer(
                                                                cust,
                                                            )
                                                        }
                                                    >
                                                        <div className="font-medium text-slate-900">
                                                            {cust.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {cust.phone}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="name"
                                        className={
                                            errors.name
                                                ? 'text-destructive'
                                                : ''
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
                                                ? 'cursor-not-allowed bg-slate-100 font-medium text-slate-600'
                                                : errors.name
                                                  ? 'border-destructive'
                                                  : ''
                                        }
                                    />
                                    {selectedCustomer && (
                                        <p className="text-xs font-medium text-emerald-600">
                                            ✓ Pelanggan lama teridentifikasi.
                                        </p>
                                    )}
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Panel Perangkat */}
                            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                    <Laptop className="h-4 w-4 text-primary" />{' '}
                                    Data Perangkat
                                </h3>

                                {selectedCustomer &&
                                    selectedCustomer.devices &&
                                    selectedCustomer.devices.length > 0 && (
                                        <div className="space-y-2 rounded-lg border bg-white p-3 shadow-sm">
                                            <Label className="text-xs tracking-wider text-slate-500 uppercase">
                                                Pilih dari riwayat perangkat
                                            </Label>
                                            <Select
                                                value={data.device_id}
                                                onValueChange={(val) =>
                                                    setData('device_id', val)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="-- Daftarkan Perangkat Baru --" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        value="new_device"
                                                        className="font-bold text-primary"
                                                    >
                                                        -- ➕ Daftarkan
                                                        Perangkat Baru --
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
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="device_type">
                                                    Jenis
                                                </Label>
                                                <Input
                                                    id="device_type"
                                                    list="device-types"
                                                    placeholder="Cth: Laptop"
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
                                                    <p className="text-xs text-destructive">
                                                        {errors.device_type}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="brand">
                                                    Merek
                                                </Label>
                                                <Input
                                                    id="brand"
                                                    list="brands"
                                                    placeholder="Cth: Asus"
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
                                                                value={brand}
                                                            />
                                                        ),
                                                    )}
                                                </datalist>
                                                {errors.brand && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.brand}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="model">
                                                Tipe/Model (Opsional)
                                            </Label>
                                            <Input
                                                id="model"
                                                placeholder="Cth: ROG Strix G15"
                                                value={data.model}
                                                onChange={(e) =>
                                                    setData(
                                                        'model',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.model && (
                                                <p className="text-xs text-destructive">
                                                    {errors.model}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* KANAN: KELUHAN & TAGIHAN */}
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="complaint"
                                    className={
                                        errors.complaint
                                            ? 'text-destructive'
                                            : ''
                                    }
                                >
                                    Keluhan Kerusakan{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="complaint"
                                    placeholder="Deskripsikan keluhan pelanggan atau kerusakan secara detail..."
                                    className={`h-28 resize-none ${errors.complaint ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    value={data.complaint}
                                    onChange={(e) =>
                                        setData('complaint', e.target.value)
                                    }
                                />
                                {errors.complaint && (
                                    <p className="text-xs text-destructive">
                                        {errors.complaint}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-800">
                                    Kelengkapan Bawaan
                                </Label>
                                <div className="flex flex-wrap gap-4 rounded-lg border bg-slate-50/50 p-3">
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
                                                    handleEquipmentToggle(item)
                                                }
                                            />
                                            <label
                                                htmlFor={`eq-${item}`}
                                                className="cursor-pointer text-sm leading-none font-medium"
                                            >
                                                {item}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex items-center space-x-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm transition-all hover:bg-emerald-100">
                                    <Checkbox
                                        id="is_technician_on_site"
                                        checked={data.is_technician_on_site}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'is_technician_on_site',
                                                checked as boolean,
                                            )
                                        }
                                        className="h-5 w-5 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
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
                                        <label className="cursor-pointer text-sm leading-none font-bold">
                                            Teknisi Ada & Langsung Dicek?
                                        </label>
                                        <p className="text-xs text-emerald-700">
                                            Centang jika kerusakan dan harga
                                            sudah deal di tempat.
                                        </p>
                                    </div>
                                </div>

                                {data.is_technician_on_site && (
                                    <div className="mt-4 grid animate-in grid-cols-2 gap-4 rounded-lg border bg-white p-4 shadow-inner fade-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="estimated_cost">
                                                Estimasi Biaya (Rp)
                                            </Label>
                                            <Input
                                                id="estimated_cost"
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                value={data.estimated_cost}
                                                onChange={(e) =>
                                                    setData(
                                                        'estimated_cost',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.estimated_cost && (
                                                <p className="text-xs text-destructive">
                                                    {errors.estimated_cost}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="down_payment">
                                                Uang Muka/DP (Rp)
                                            </Label>
                                            <Input
                                                id="down_payment"
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                value={data.down_payment}
                                                onChange={(e) =>
                                                    setData(
                                                        'down_payment',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.down_payment && (
                                                <p className="text-xs text-destructive">
                                                    {errors.down_payment}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="-mx-6 mt-8 -mb-6 rounded-b-lg border-t bg-slate-50 px-6 pt-5 pb-6">
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
                            className="min-w-[150px]"
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
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
