import { motion } from 'framer-motion';
import { Laptop } from 'lucide-react';

export function Navbar({ store }: { store: any }) {
    return (
        <motion.nav 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-6 left-1/2 z-50 w-[90%] max-w-6xl -translate-x-1/2 rounded-full border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-lg font-bold tracking-tight text-foreground">
                    {store.logo_path ? (
                        <img src={store.logo_path} alt={store.store_name} className="h-7 w-auto object-contain" />
                    ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/50 text-primary-foreground shadow-lg shadow-primary/20">
                            <Laptop className="h-5 w-5" />
                        </div>
                    )}
                    <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">{store.store_name}</span>
                </div>
                <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
                    <a href="#keunggulan" className="transition-colors hover:text-foreground">Keunggulan</a>
                    <a href="#layanan" className="transition-colors hover:text-foreground">Layanan</a>
                    <a href="#katalog" className="transition-colors hover:text-foreground">Katalog</a>
                    <a href="#lokasi" className="transition-colors hover:text-foreground">Lokasi</a>
                </div>
            </div>
        </motion.nav>
    );
}
