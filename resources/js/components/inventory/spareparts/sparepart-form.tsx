import { useForm } from '@inertiajs/react';
import { Loader2, ShieldAlert } from 'lucide-react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/ui/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SparePart } from '@/types/sparepart';

interface Props {
    part?: SparePart | null;
    onSuccess?: () => void;
}

export function SparepartForm({ part, onSuccess }: Props) {
    const isEdit = !!part;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        sku: part?.sku ?? '',
        name: part?.name ?? '',
        purchase_price: part?.purchase_price ? Number(part.purchase_price).toString() : '',
        selling_price: part?.selling_price ? Number(part.selling_price).toString() : '',
        is_always_indent: part?.is_always_indent ?? false,
    });

    // Helper Rupiah 
    const formatNumberWithDots = (val: string) => {
        const clean = val.replace(/\D/g, '');
        return clean ? new Intl.NumberFormat('id-ID').format(Number(clean)) : '';
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        clearErrors();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onSuccess?.();
            },
        };

        if (isEdit) {
            put(`/inventory/spareparts/${part.id}`, options);
        } else {
            post('/inventory/spareparts', options);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4 py-4">
            {!isEdit && (
                <Alert className="bg-blue-50 text-blue-800 border-blue-200 shadow-sm dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300">
                    <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-xs ml-2 font-medium">
                        Penambahan stok fisik tidak dilakukan di form ini, melainkan melalui menu <b>Pengadaan Barang</b> untuk menjaga audit keuangan toko.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-2">
                <Label htmlFor="name">Nama Barang / Sparepart <span className="text-destructive">*</span></Label>
                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Contoh: Keyboard Asus ROG Strix" disabled={processing} required />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="sku">Kode SKU (Opsional)</Label>
                <Input id="sku" className="font-mono uppercase" value={data.sku} onChange={(e) => setData('sku', e.target.value.toUpperCase())} placeholder="Cth: SPR-1092" disabled={processing} />
                <InputError message={errors.sku} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="purchase_price">Harga Modal <span className="text-destructive">*</span></Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-sm text-muted-foreground">Rp</span>
                        <Input id="purchase_price" className="pl-9 font-mono" value={formatNumberWithDots(data.purchase_price)} onChange={(e) => setData('purchase_price', e.target.value.replace(/\D/g, ''))} disabled={processing} required />
                    </div>
                    <InputError message={errors.purchase_price} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="selling_price">Harga Jual <span className="text-destructive">*</span></Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-sm text-muted-foreground">Rp</span>
                        <Input id="selling_price" className="pl-9 font-mono" value={formatNumberWithDots(data.selling_price)} onChange={(e) => setData('selling_price', e.target.value.replace(/\D/g, ''))} disabled={processing} required />
                    </div>
                    <InputError message={errors.selling_price} />
                </div>
            </div>

            <div className="flex items-start space-x-3 pt-2">
                <Checkbox id="indent" checked={data.is_always_indent} onCheckedChange={(chk) => setData('is_always_indent', chk as boolean)} disabled={processing} />
                <div className="space-y-1 leading-none">
                    <Label htmlFor="indent" className="cursor-pointer">Barang Sifatnya Pre-Order (Inden)</Label>
                    <p className="text-xs text-muted-foreground">Centang jika barang jarang distok di toko.</p>
                </div>
            </div>

            <div className="flex justify-end pt-5 gap-3">
                <Button type="button" variant="outline" onClick={() => { reset(); clearErrors(); onSuccess?.(); }} disabled={processing}>Batal</Button>
                <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Simpan Perubahan' : 'Simpan Barang'}
                </Button>
            </div>
        </form>
    );
}
