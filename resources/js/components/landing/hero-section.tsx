import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection({ store, sliderImages, currentSlide }: { store: any; sliderImages: string[]; currentSlide: number }) {
    return (
        <section className="relative flex min-h-[100svh] items-center justify-center pt-24 pb-12">
            {sliderImages.length > 0 && (
                <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay">
                    {sliderImages.map((img: string, i: number) => (
                        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                            <img src={img} className="h-full w-full object-cover" alt="Hero bg" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background"></div>
                        </div>
                    ))}
                </div>
            )}

            <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-auto flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-primary/20 bg-primary/10 px-6 py-2 backdrop-blur-md mb-8 shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)]"
                >
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{store.hero_badge}</span>
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tighter text-foreground sm:text-7xl md:text-8xl"
                >
                    {store.hero_headline} <br className="hidden md:block" />
                    <span className="bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent">
                        {store.hero_headline_highlight}
                    </span>
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl font-medium leading-relaxed"
                >
                    {store.hero_description}
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-12 flex flex-col justify-center gap-4 sm:flex-row"
                >
                    <Button size="lg" asChild className="h-14 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] transition-all hover:scale-105 hover:bg-primary/90">
                        <a href="#katalog" className="flex items-center gap-2">
                            Lihat Stok Laptop
                            <ChevronRight className="h-4 w-4" />
                        </a>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="h-14 rounded-full border-white/10 bg-white/5 px-8 text-base font-semibold text-foreground backdrop-blur-md transition-all hover:bg-white/10 hover:text-foreground">
                        <a href="#layanan">Layanan Servis</a>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
