import { Button } from '@/components/ui/button';
import { LandingProduct } from '@/types/landing';

export function ProductCard({ laptop }: { laptop: LandingProduct }) {
    return (
        <div className="group flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.4)] hover:border-primary/40">
            {laptop.image ? (
                <div className="relative h-48 w-full overflow-hidden bg-black/50">
                    <img 
                        src={laptop.image} 
                        alt={laptop.name} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
            ) : (
                <div className="relative h-48 w-full overflow-hidden bg-black/50 flex items-center justify-center">
                    <span className="text-zinc-600">Tidak ada gambar</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
            )}
            <div className="p-8 pb-6 flex-grow">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-bold leading-tight text-white transition-colors group-hover:text-primary">{laptop.name}</h3>
                    {laptop.status === 'ready' ? (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-primary/20 border border-primary/30 px-3 py-1.5 text-xs font-bold tracking-wide text-primary shadow-[0_0_15px_-3px_rgba(var(--primary),0.4)]">
                            Tersedia
                        </span>
                    ) : (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-bold tracking-wide text-zinc-300">
                            {laptop.status}
                        </span>
                    )}
                </div>
                <div className="mt-6 space-y-4">
                    <p className="line-clamp-3 text-sm leading-relaxed text-zinc-300">
                        {laptop.specs}
                    </p>
                </div>
            </div>
            
            <div className="mt-auto flex items-center justify-between border-t border-white/10 bg-black/40 p-6 backdrop-blur-md transition-colors group-hover:bg-primary/10">
                <span className="text-2xl font-extrabold text-white tracking-tight">{laptop.price}</span>
                <Button 
                    disabled={laptop.status !== 'ready'} 
                    size="lg" 
                    className={laptop.status === 'ready' ? 'h-12 rounded-full bg-primary px-6 font-bold text-primary-foreground shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)] transition-all hover:scale-105 hover:bg-primary/90' : 'h-12 rounded-full bg-white/10 text-zinc-500 px-6 border border-white/5'}
                >
                    {laptop.status === 'ready' ? 'Beli Sekarang' : 'Habis'}
                </Button>
            </div>
        </div>
    );
}
