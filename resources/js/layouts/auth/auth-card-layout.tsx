import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { home } from '@/routes';
import { ShieldCheck, Cpu, Database, Laptop } from 'lucide-react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    useFlashToast();

    return (
        <div className="dark flex min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
            {/* Panel Kiri: Branding (Tersembunyi di layar kecil) */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden bg-zinc-950 p-12 border-r border-white/5">
                {/* Glowing Abstract Background Elements */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[10%] -right-[20%] h-[600px] w-[600px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px] pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-3 font-bold text-2xl tracking-tight text-white">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/50 text-primary-foreground shadow-lg shadow-primary/20">
                        <Laptop className="size-6" />
                    </div>
                    Anugerah Computer
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight text-white">
                        Sistem ERP Terpadu & <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Manajemen Servis</span>
                    </h1>
                    <p className="text-zinc-400 text-lg mb-10 leading-relaxed font-medium">
                        Platform manajemen operasional tingkat enterprise. Kelola transaksi, perbaikan perangkat, inventaris, dan finansial dalam satu ekosistem cerdas.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-zinc-300 transition-transform hover:translate-x-2">
                            <div className="p-3 bg-white/5 rounded-xl shadow-inner border border-white/10">
                                <Database className="w-6 h-6 text-primary" />
                            </div>
                            <span className="font-medium text-lg">Sentralisasi Data Operasional</span>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-300 transition-transform hover:translate-x-2">
                            <div className="p-3 bg-white/5 rounded-xl shadow-inner border border-white/10">
                                <Cpu className="w-6 h-6 text-primary" />
                            </div>
                            <span className="font-medium text-lg">Otomatisasi AI & Bot WhatsApp</span>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-300 transition-transform hover:translate-x-2">
                            <div className="p-3 bg-white/5 rounded-xl shadow-inner border border-white/10">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <span className="font-medium text-lg">Keamanan Akses Tingkat Lanjut</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-zinc-500 font-medium">
                    &copy; {new Date().getFullYear()} Anugerah Computer. Hak Cipta Dilindungi.
                </div>
            </div>

            {/* Panel Kanan: Form Autentikasi */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 sm:p-12 relative bg-background">
                
                {/* Logo Mobile (Hanya terlihat di layar HP) */}
                <Link
                    href={home()}
                    className="flex lg:hidden flex-col items-center gap-4 mb-10 font-medium group transition-transform hover:scale-105"
                >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/50 text-white shadow-lg shadow-primary/20 ring-1 ring-white/10">
                        <Laptop className="size-8" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-black tracking-tight text-white">
                            Anugerah ERP
                        </h1>
                    </div>
                </Link>

                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-3">
                            {title}
                        </h2>
                        <p className="text-zinc-400 font-medium text-base">
                            {description}
                        </p>
                    </div>

                    <div className="bg-card/40 backdrop-blur-3xl p-8 sm:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
