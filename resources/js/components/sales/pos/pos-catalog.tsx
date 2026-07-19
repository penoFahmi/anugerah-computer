import { Search, Laptop, Wrench, PackageSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            // Barcode Scanner logic: If exactly 1 result matches, auto add it to cart.
            const totalMatches = filteredProducts.length + filteredSpareparts.length;
            if (totalMatches === 1) {
                if (filteredProducts.length === 1) addToCart({ ...filteredProducts[0], type: 'product' });
                else if (filteredSpareparts.length === 1) addToCart({ ...filteredSpareparts[0], type: 'sparepart' });
                setSearchQuery('');
            } else if (totalMatches > 1) {
                toast.info('Pencarian menghasilkan lebih dari 1 barang. Silakan pilih manual.');
            } else {
                toast.error('Barang tidak ditemukan!');
            }
        }
    };

    return (
        <div className="w-full lg:w-[65%] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-10 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                        id="pos-search-input"
                        placeholder="Cari nama, SKU, atau Barcode barang... (F1)" 
                        className="pl-12 h-14 text-lg shadow-sm font-medium rounded-xl border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 focus-visible:ring-blue-500"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <Tabs defaultValue="all" className="w-full h-full flex flex-col">
                    <TabsList className="w-full justify-start mb-6 bg-white dark:bg-slate-950 p-1 border shadow-sm rounded-lg h-12">
                        <TabsTrigger value="all" className="flex-1 h-full text-base font-medium rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            Semua
                        </TabsTrigger>
                        <TabsTrigger value="laptop" className="flex-1 h-full text-base font-medium rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            Laptop Second
                        </TabsTrigger>
                        <TabsTrigger value="sparepart" className="flex-1 h-full text-base font-medium rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            Sparepart / Aksesoris
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0 space-y-8 flex-1 outline-none">
                        <CatalogSection 
                            title="Laptop Second" 
                            icon={Laptop} 
                            items={filteredProducts} 
                            type="product" 
                            addToCart={addToCart} 
                            formatRupiah={formatRupiah} 
                        />
                        <CatalogSection 
                            title="Sparepart & Aksesoris" 
                            icon={Wrench} 
                            items={filteredSpareparts} 
                            type="sparepart" 
                            addToCart={addToCart} 
                            formatRupiah={formatRupiah} 
                        />
                        {filteredProducts.length === 0 && filteredSpareparts.length === 0 && (
                            <EmptyState />
                        )}
                    </TabsContent>

                    <TabsContent value="laptop" className="mt-0 outline-none">
                        <CatalogSection 
                            title="Laptop Second" 
                            icon={Laptop} 
                            items={filteredProducts} 
                            type="product" 
                            addToCart={addToCart} 
                            formatRupiah={formatRupiah} 
                        />
                        {filteredProducts.length === 0 && <EmptyState />}
                    </TabsContent>

                    <TabsContent value="sparepart" className="mt-0 outline-none">
                        <CatalogSection 
                            title="Sparepart & Aksesoris" 
                            icon={Wrench} 
                            items={filteredSpareparts} 
                            type="sparepart" 
                            addToCart={addToCart} 
                            formatRupiah={formatRupiah} 
                        />
                        {filteredSpareparts.length === 0 && <EmptyState />}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// --- Helper Components ---
function CatalogSection({ title, icon: Icon, items, type, addToCart, formatRupiah }: any) {
    if (items.length === 0) return null;
    
    return (
        <div>
            <h3 className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 mb-4 text-lg">
                <Icon className="h-5 w-5 text-blue-600" /> {title} <span className="text-sm font-normal text-muted-foreground ml-2">({items.length} item)</span>
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((item: any) => (
                    <div 
                        key={`${type}-${item.id}`} 
                        onClick={() => addToCart({ ...item, type })}
                        className="group flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 active:scale-95"
                    >
                        <div className="p-4 flex-1">
                            {/* Jika ada image, bisa ditaruh di sini nantinya */}
                            <div className="font-bold text-[15px] leading-tight text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3 h-[60px]">
                                {item.name}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500">
                                {type === 'product' ? (
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{item.ram} | {item.storage}</span>
                                ) : (
                                    <span className={item.stock < 5 ? "text-red-500 font-bold bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-md" : "bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md"}>
                                        Sisa: {item.stock}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="font-black text-[17px] text-blue-700 dark:text-blue-400">
                                {formatRupiah(Number(item.selling_price))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
            <PackageSearch className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Barang tidak ditemukan</p>
            <p className="text-sm">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
    );
}