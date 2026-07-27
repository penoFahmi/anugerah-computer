import { Button } from '@/components/ui/button';
import { LandingProduct } from '@/types/landing';
import { ProductCard } from './product-card';
import { ArrowRight, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';

interface ProductListProps {
    products: LandingProduct[];
}

export function ProductList({ products }: ProductListProps) {
    return (
        <div className="container mx-auto px-4 md:px-6">
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mb-16 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left"
            >
                <div className="max-w-2xl">
                    <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Katalog Pilihan</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Stok laptop terbaik, siap pakai untuk kerja, kuliah, atau sekolah dengan harga bersahabat.</p>
                </div>
                {products.length > 0 && (
                    <Button asChild variant="outline" className="group h-12 rounded-full border-white/10 bg-white/5 px-8 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-primary/50 hover:text-white shadow-lg shadow-black/20">
                        <Link href="/katalog">
                            Lihat Semua Stok 
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                )}
            </motion.div>

            {products.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm"
                >
                    <div className="mb-6 rounded-2xl bg-white/5 p-5 text-muted-foreground border border-white/10 shadow-inner">
                        <Laptop className="h-10 w-10 text-primary/70" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Belum Ada Stok</h3>
                    <p className="mt-3 max-w-sm text-base text-muted-foreground">Maaf, saat ini belum ada stok laptop yang tersedia di etalase kami.</p>
                </motion.div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                    {products.map((laptop, index) => (
                        <motion.div
                            key={laptop.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <ProductCard laptop={laptop} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
