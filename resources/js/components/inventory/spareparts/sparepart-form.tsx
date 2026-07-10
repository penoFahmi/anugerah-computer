import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { SparePart } from '@/types/inventory';

interface Props {
    item?: SparePart | null;
    onSuccess?: () => void;
}

export function SparepartForm({ item, onSuccess }: Props) {
    const isEdit = !!item;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        sku: item?.sku ?? '',
        name: item?.name ?? '',
        purchase_price: item?.purchase_price ?? '',
        selling_price: item?.selling_price ?? '',
        stock: item?.stock ?? 0,
        is_always_indent: item?.is_always_indent ?? false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        clearErrors();

        if (isEdit) {
            put(`/inventory/spareparts/${item.id}`, {
                preserveScroll: true,
                onSuccess: () => { reset(); onSuccess?.(); },
            });
        } else {
            post('/inventory/spareparts', {
                preserveScroll: true,
                onSuccess: () => { reset(); onSuccess?.(); },
            });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="sku">SKU / Kode Barang (Opsional)</Label>
                <Input 
                    id="sku" 
                    value={data.sku} 
                    onChange={(e) => setData('sku', e.target.value)} 
                    placeholder="Contoh: LCD-ASUS-14"
                    disabled={processing}
                />
                <InputError message={errors.sku} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="name">Nama Barang <span className="text-destructive">*</span></Label>
                <Input 
                    id="name" 
                    value={data.name} 
                    onChange={(e) => setData('name', e.target.value)} 
                    placeholder="Contoh: LCD Asus X441"
                    disabled={processing}
                    required 
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="purchase_price">Harga Beli / Modal <span className="text-destructive">*</span></Label>
                    <Input 
                        id="purchase_price" 
                        type="number" 
                        value={data.purchase_price} 
                        onChange={(e) => setData('purchase_price', e.target.value)} 
                        disabled={processing}
                        required 
                    />
                    <InputError message={errors.purchase_price} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="selling_price">Harga Jual <span className="text-destructive">*</span></Label>
                    <Input 
                        id="selling_price" 
                        type="number" 
                        value={data.selling_price} 
                        onChange={(e) => setData('selling_price', e.target.value)} 
                        disabled={processing}
                        required 
                    />
                    <InputError message={errors.selling_price} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="stock">Jumlah Stok Fisik <span className="text-destructive">*</span></Label>
                <Input 
                    id="stock" 
                    type="number" 
                    value={data.stock} 
                    onChange={(e) => setData('stock', parseInt(e.target.value) || 0)} 
                    disabled={processing || data.is_always_indent}
                    required 
                />
                <InputError message={errors.stock} />
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-4">
                <Checkbox 
                    id="is_always_indent" 
                    checked={data.is_always_indent}
                    onCheckedChange={(checked) => {
                        setData('is_always_indent', checked === true);
                        if (checked) setData('stock', 0); // Reset stok kalau jadi barang inden
                    }}
                    disabled={processing}
                />
                <div className="space-y-1 leading-none">
                    <Label htmlFor="is_always_indent" className="cursor-pointer">
                        Barang Pre-Order (Selalu Inden)
                    </Label>
                    <p className="text-[13px] text-muted-foreground">
                        Centang jika barang ini tidak pernah distok di toko dan harus dipesan dulu.
                    </p>
                </div>
            </div>

            <div className="flex justify-end pt-5 gap-3">
                <Button type="button" variant="outline" onClick={() => { reset(); clearErrors(); onSuccess?.(); }} disabled={processing}>
                    Batal
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Simpan Perubahan' : 'Tambahkan Barang'}
                </Button>
            </div>
        </form>
    );
}