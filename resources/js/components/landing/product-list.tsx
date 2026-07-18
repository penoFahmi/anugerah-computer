import { Button } from '@/components/ui/button';
import { LandingProduct } from '@/types/landing';
import { ProductCard } from './product-card';

interface ProductListProps {
    products: LandingProduct[];
}

export function ProductList({ products }: ProductListProps) {
    return (
        <section id="katalog" className="py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Katalog Pilihan</h2>
                        <p className="mt-2 text-slate-600">Stok laptop terbaik, siap pakai untuk kerja, kuliah, atau sekolah.</p>
                    </div>
                    {products.length > 0 && (
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            Lihat Semua Stok &rarr;
                        </Button>
                    )}
                </div>

                {products.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                        <p className="text-lg font-medium text-slate-500">Belum ada stok laptop yang tersedia saat ini.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((laptop) => (
                            <ProductCard key={laptop.id} laptop={laptop} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
