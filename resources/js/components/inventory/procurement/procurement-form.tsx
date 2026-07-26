import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/ui/input-error';
import type { SparePart } from '@/types/sparepart';

export function ProcurementForm({ spareparts, onSuccess }: { spareparts: SparePart[], onSuccess: () => void }) {
    const [selectedId, setSelectedId] = useState<string>('');
    const { data, setData, post, processing, errors } = useForm({
        spare_part_id: '',
        quantity: '1',
        new_purchase_price: '',
        new_selling_price: '',
        total_expense: '',
        supplier_note: '',
    });

    const selectedPart = useMemo(() => spareparts.find(p => p.id.toString() === selectedId), [selectedId, spareparts]);

    // Saat barang dipilih, auto-fill harga
    const handlePartChange = (id: string) => {
        const part = spareparts.find(p => p.id.toString() === id);
        if (part) {
            setData({
                spare_part_id: id,
                quantity: data.quantity,
                new_purchase_price: Number(part.purchase_price).toString(),
                new_selling_price: Number(part.selling_price).toString(),
                total_expense: (Number(data.quantity) * Number(part.purchase_price)).toString(),
                supplier_note: data.supplier_note
            });
            setSelectedId(id);
        }
    };

    const handleCalc = (key: string, val: string) => {
        const qty = key === 'quantity' ? Number(val) : Number(data.quantity);
        const price = key === 'new_purchase_price' ? Number(val) : Number(data.new_purchase_price);
        setData({ ...data, [key]: val, total_expense: (qty * price).toString() });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory/procurement', { onSuccess: () => onSuccess() });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
                <Label>Pilih Sparepart</Label>
                <Select onValueChange={handlePartChange}>
                    <SelectTrigger><SelectValue placeholder="Pilih barang..." /></SelectTrigger>
                    <SelectContent>
                        {spareparts.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} (Stok: {p.stock})</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Jumlah Beli</Label>
                    <Input type="number" value={data.quantity} onChange={e => handleCalc('quantity', e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label>Harga Beli (Per Pcs)</Label>
                    <Input value={data.new_purchase_price} onChange={e => handleCalc('new_purchase_price', e.target.value.replace(/\D/g, ''))} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Harga Jual Baru</Label>
                <Input value={data.new_selling_price} onChange={e => setData('new_selling_price', e.target.value.replace(/\D/g, ''))} />
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm font-semibold text-center">
                Total Biaya: Rp {Number(data.total_expense).toLocaleString('id-ID')}
            </div>

            <div className="grid gap-2">
                <Label>Catatan / Supplier</Label>
                <Input value={data.supplier_note} onChange={e => setData('supplier_note', e.target.value)} placeholder="Cth: Belanja di Toko A" />
            </div>

            <Button className="w-full" disabled={processing}>
                {processing ? <Loader2 className="animate-spin mr-2" /> : 'Catat Pengadaan'}
            </Button>
        </form>
    );
}
