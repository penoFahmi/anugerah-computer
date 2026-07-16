import { useForm } from '@inertiajs/react';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { useState, useRef } from 'react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/types/product';

interface Props {
    product?: Product | null;
    onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: Props) {
    const isEdit = !!product;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(product?.image_path ? `/storage/${product.image_path}` : null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: product?.name ?? '',
        brand: product?.brand ?? '',
        processor: product?.processor ?? '',
        ram: product?.ram ?? '',
        storage: product?.storage ?? '',
        vga: product?.vga ?? '',
        condition_notes: product?.condition_notes ?? '',
        purchase_price: product?.purchase_price ? Number(product.purchase_price).toString() : '',
        selling_price: product?.selling_price ? Number(product.selling_price).toString() : '',
        warranty_days: product?.warranty_days?.toString() ?? '30',
        status: product?.status ?? 'ready',
        image: null as File | null,
        _method: isEdit ? 'put' : 'post', // WAJIB DI LARAVEL UNTUK UPLOAD FILE SAAT UPDATE
    });

    const formatNumberWithDots = (val: string) => val.replace(/\D/g, '') ? new Intl.NumberFormat('id-ID').format(Number(val.replace(/\D/g, ''))) : '';

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        clearErrors();

        // Mengirimkan data via POST (meskipun Edit) karena berisi File (Multipart)
        const url = isEdit ? `/inventory/products/${product.id}` : '/inventory/products';
        
        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onSuccess?.();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6 py-4">
            <div className="grid md:grid-cols-3 gap-6">
                
                {/* KIRI: Upload Gambar */}
                <div className="space-y-2 col-span-1">
                    <Label>Foto Utama Laptop</Label>
                    <div 
                        className="border-2 border-dashed rounded-lg h-48 flex flex-col items-center justify-center relative bg-muted/30 hover:bg-muted/50 transition cursor-pointer overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                    <span className="text-white text-xs font-semibold">Ganti Foto</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-4 text-muted-foreground">
                                <UploadCloud className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <span className="text-xs">Klik untuk upload foto (Max 2MB)</span>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handleImageChange} />
                    </div>
                    <InputError message={errors.image} />
                </div>

                {/* KANAN: Data Spesifikasi */}
                <div className="col-span-2 space-y-4">
                    <div className="grid gap-2">
                        <Label>Nama Produk / Seri Laptop <span className="text-destructive">*</span></Label>
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Cth: Asus ROG Strix G513" required />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Merek (Brand)</Label>
                            <Input value={data.brand} onChange={e => setData('brand', e.target.value)} placeholder="Cth: Asus" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Prosesor</Label>
                            <Input value={data.processor} onChange={e => setData('processor', e.target.value)} placeholder="Cth: AMD Ryzen 7" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Kapasitas RAM</Label>
                            <Input value={data.ram} onChange={e => setData('ram', e.target.value)} placeholder="Cth: 16GB DDR4" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Penyimpanan (Storage)</Label>
                            <Input value={data.storage} onChange={e => setData('storage', e.target.value)} placeholder="Cth: 512GB SSD NVMe" />
                        </div>
                    </div>
                </div>
            </div>

            {/* BAWAH: Harga, Garansi, Kondisi */}
            <div className="grid md:grid-cols-3 gap-4 border-t pt-4">
                <div className="grid gap-2">
                    <Label>Harga Modal (HPP) <span className="text-destructive">*</span></Label>
                    <Input className="font-mono" value={formatNumberWithDots(data.purchase_price)} onChange={e => setData('purchase_price', e.target.value.replace(/\D/g, ''))} required />
                    <InputError message={errors.purchase_price} />
                </div>
                <div className="grid gap-2">
                    <Label>Harga Jual <span className="text-destructive">*</span></Label>
                    <Input className="font-mono" value={formatNumberWithDots(data.selling_price)} onChange={e => setData('selling_price', e.target.value.replace(/\D/g, ''))} required />
                    <InputError message={errors.selling_price} />
                </div>
                <div className="grid gap-2">
                    <Label>Masa Garansi (Hari)</Label>
                    <Input type="number" value={data.warranty_days} onChange={e => setData('warranty_days', e.target.value)} required />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 grid gap-2">
                    <Label>Catatan Kondisi / Minus</Label>
                    <Textarea value={data.condition_notes} onChange={e => setData('condition_notes', e.target.value)} placeholder="Cth: Baret halus di casing atas, baterai tahan 2 jam." rows={3} />
                </div>
                <div className="col-span-1 grid gap-2">
                    <Label>Status Ketersediaan</Label>
                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ready">Tersedia (Ready)</SelectItem>
                            <SelectItem value="booked">Di-Booking</SelectItem>
                            <SelectItem value="sold">Terjual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { reset(); onSuccess?.(); }} disabled={processing}>Batal</Button>
                <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Laptop'}
                </Button>
            </div>
        </form>
    );
}