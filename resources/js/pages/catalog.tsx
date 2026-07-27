import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, SlidersHorizontal, PackageX } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { ProductCard } from '@/components/landing/product-card';
import { FloatingChatbot } from '@/components/chatbot/floating-chatbot';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function CatalogPage({ products, brands, filters, store }: any) {
    const [searchQuery, setSearchQuery] = useState(filters?.q || '');
    const [selectedBrand, setSelectedBrand] = useState(filters?.brand || 'all');
    
    // Fungsi untuk memicu pencarian (mengubah URL tanpa reload halaman penuh)
    const applyFilters = (q: string, brand: string) => {
        const params: any = {};
        if (q) params.q = q;
        if (brand && brand !== 'all') params.brand = brand;
        
        router.get('/katalog', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(searchQuery, selectedBrand);
    };

    const handleBrandChange = (value: string) => {
        setSelectedBrand(value);
        applyFilters(searchQuery, value);
    };

    return (
        <div className="dark relative min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden pt-32 flex flex-col">
            <Head title={`Katalog Laptops | ${store.store_name}`} />

            {/* Background elements sama seperti welcome.tsx */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute -top-[20%] -left-[10%] h-[1000px] w-[1000px] rounded-full bg-primary/10 blur-[120px]" />
            </div>

            <Navbar store={store} />

            <main className="container relative z-10 mx-auto px-4 md:px-6 flex-grow mb-32">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Katalog Lengkap</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl">Jelajahi seluruh stok laptop kami. Gunakan pencarian atau filter untuk menemukan laptop yang paling cocok untuk Anda.</p>
                </div>

                {/* Filter & Search Bar */}
                <div className="mb-10 flex flex-col sm:flex-row gap-4 p-4 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
                    <form onSubmit={handleSearch} className="flex-grow flex items-center relative">
                        <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama laptop, RAM, Prosesor..." 
                            className="w-full h-14 pl-12 rounded-xl bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary focus-visible:border-primary"
                        />
                    </form>
                    <div className="w-full sm:w-64 shrink-0 flex items-center gap-3">
                        <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                            <SlidersHorizontal className="h-5 w-5" />
                        </div>
                        <Select value={selectedBrand} onValueChange={handleBrandChange}>
                            <SelectTrigger className="w-full h-14 rounded-xl bg-black/20 border-white/10 text-white focus:ring-primary">
                                <SelectValue placeholder="Semua Merk" />
                            </SelectTrigger>
                            <SelectContent className="dark">
                                <SelectItem value="all">Semua Merk</SelectItem>
                                {brands.map((brand: string) => (
                                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Grid Produk */}
                {products.data.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm mt-8">
                        <div className="mb-6 rounded-2xl bg-white/5 p-5 text-muted-foreground border border-white/10 shadow-inner">
                            <PackageX className="h-12 w-12 opacity-50" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Laptop Tidak Ditemukan</h3>
                        <p className="mt-3 text-muted-foreground max-w-sm">Maaf, kami tidak menemukan stok yang cocok dengan kriteria pencarian Anda.</p>
                        <Button variant="outline" onClick={() => applyFilters('', 'all')} className="mt-6 rounded-full h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white">Reset Filter</Button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                        {products.data.map((laptop: any) => (
                            <ProductCard key={laptop.id} laptop={laptop} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="mt-16 flex flex-wrap justify-center gap-2">
                        {products.links.map((link: any, idx: number) => {
                            if (link.url === null) {
                                return (
                                    <div key={idx} className="h-12 px-5 flex items-center justify-center rounded-xl border border-white/5 text-muted-foreground opacity-50 bg-white/5" dangerouslySetInnerHTML={{ __html: link.label }}></div>
                                );
                            }
                            
                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        router.get(link.url, {}, { preserveScroll: true, preserveState: true });
                                    }}
                                    className={`h-12 min-w-[3rem] px-5 flex items-center justify-center rounded-xl border font-medium transition-all ${link.active ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]' : 'border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer store={store} />
            <FloatingChatbot />
        </div>
    );
}
