import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';

export function ProcurementForm({ onSuccess }: { onSuccess: () => void }) {
    const [selectedId, setSelectedId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [fetchedParts, setFetchedParts] = useState<any[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        spare_part_id: '',
        quantity: '1',
        new_purchase_price: '',
        new_selling_price: '',
        total_expense: '',
        supplier_note: '',
    });

    useEffect(() => {
        const delay = setTimeout(() => {
            if (searchQuery) {
                axios.get(`/api/spare-parts/search?q=${searchQuery}`).then(res => setFetchedParts(res.data));
            } else {
                setFetchedParts([]);
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [searchQuery]);

    // Saat barang dipilih, auto-fill harga
    const handlePartChange = (part: any) => {
        setData({
            ...data,
            spare_part_id: part.id.toString(),
            new_purchase_price: Number(part.purchase_price ?? 0).toString(),
            new_selling_price: Number(part.selling_price ?? 0).toString(),
            total_expense: (Number(data.quantity) * Number(part.purchase_price ?? 0)).toString(),
        });
        setSelectedId(part.id.toString());
        setSearchQuery(part.name);
        setDropdownOpen(false);
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
            <div className="grid gap-2 relative">
                <Label>Cari & Pilih Sparepart</Label>
                <div className="relative">
                    <Input 
                        placeholder="Ketik nama atau SKU..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setDropdownOpen(true)}
                    />
                </div>
                {dropdownOpen && fetchedParts.length > 0 && (
                    <div className="absolute top-16 z-50 w-full max-h-[200px] overflow-y-auto bg-popover border rounded-md shadow-md custom-scrollbar">
                        {fetchedParts.map(p => (
                            <div 
                                key={p.id} 
                                className="px-3 py-2 cursor-pointer hover:bg-muted text-sm border-b last:border-0"
                                onClick={() => handlePartChange(p)}
                            >
                                <div className="font-semibold">{p.name}</div>
                                <div className="text-xs text-muted-foreground">Stok: {p.stock} | Jual: Rp {p.selling_price}</div>
                            </div>
                        ))}
                    </div>
                )}
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
