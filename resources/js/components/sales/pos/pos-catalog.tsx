import { Search, Laptop, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { PosProduct, PosSparepart } from '@/types/pos';

interface Props {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filteredProducts: PosProduct[];
    filteredSpareparts: PosSparepart[];
    addToCart: (item: PosProduct | PosSparepart) => void;
}

export function PosCatalog({ searchQuery, setSearchQuery, filteredProducts, filteredSpareparts, addToCart }: Props) {
    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    return (
        <div className="w-full lg:w-3/5 flex flex-col border-r bg-card h-full">
            <div className="p-4 border-b bg-muted/30">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Cari nama laptop atau sparepart..." 
                        className="pl-10 h-11 text-lg shadow-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                    {/* Kategori Laptop Second */}
                    {filteredProducts.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 font-semibold text-muted-foreground mb-3">
                                <Laptop className="h-5 w-5" /> Laptop Second (Tersedia)
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredProducts.map(p => (
                                    <div 
                                        key={`prod-${p.id}`} 
                                        onClick={() => addToCart({ ...p, type: 'product' })}
                                        className="border rounded-xl p-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition bg-background"
                                    >
                                        <div className="font-semibold text-sm line-clamp-2 leading-tight h-10">{p.name}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{p.ram} | {p.storage}</div>
                                        <div className="font-bold text-blue-600 dark:text-blue-400 mt-2">{formatRupiah(Number(p.selling_price))}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Kategori Sparepart & Aksesoris */}
                    {filteredSpareparts.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 font-semibold text-muted-foreground mb-3">
                                <Wrench className="h-5 w-5" /> Sparepart & Aksesoris
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredSpareparts.map(s => (
                                    <div 
                                        key={`spr-${s.id}`} 
                                        onClick={() => addToCart({ ...s, type: 'sparepart' })}
                                        className="border rounded-xl p-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition bg-background flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="font-semibold text-sm line-clamp-2 leading-tight">{s.name}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Stok: {s.stock}</div>
                                        </div>
                                        <div className="font-bold text-blue-600 dark:text-blue-400 mt-2">{formatRupiah(Number(s.selling_price))}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredProducts.length === 0 && filteredSpareparts.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground">
                            Barang tidak ditemukan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}