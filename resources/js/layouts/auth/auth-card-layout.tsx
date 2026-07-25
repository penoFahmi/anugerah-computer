import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { home } from '@/routes';
import { ShieldCheck, Cpu, Database } from 'lucide-react';

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
        <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
            {/* Panel Kiri: Branding (Tersembunyi di layar kecil) */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-12 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]" />
                
                <div className="relative z-10 flex items-center gap-3 font-bold text-2xl tracking-tight">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
                        <AppLogoIcon className="size-7 fill-white" />
                    </div>
                    Anugerah Computer
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-black mb-6 leading-tight tracking-tight">
                        Sistem ERP Terpadu & Manajemen Servis
                    </h1>
                    <p className="text-blue-200 text-lg mb-10 leading-relaxed font-medium">
                        Platform manajemen operasional tingkat enterprise. Kelola transaksi, perbaikan perangkat, inventaris, dan finansial dalam satu ekosistem cerdas.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-blue-100 transition-transform hover:translate-x-2">
                            <div className="p-3 bg-blue-800/40 rounded-xl shadow-inner border border-blue-700/50">
                                <Database className="w-6 h-6 text-blue-300" />
                            </div>
                            <span className="font-medium text-lg">Sentralisasi Data Operasional</span>
                        </div>
                        <div className="flex items-center gap-4 text-blue-100 transition-transform hover:translate-x-2">
                            <div className="p-3 bg-blue-800/40 rounded-xl shadow-inner border border-blue-700/50">
                                <Cpu className="w-6 h-6 text-blue-300" />
                            </div>
                            <span className="font-medium text-lg">Otomatisasi AI & Bot WhatsApp</span>
                        </div>
                        <div className="flex items-center gap-4 text-blue-100 transition-transform hover:translate-x-2">
                            <div className="p-3 bg-blue-800/40 rounded-xl shadow-inner border border-blue-700/50">
                                <ShieldCheck className="w-6 h-6 text-blue-300" />
                            </div>
                            <span className="font-medium text-lg">Keamanan Akses Tingkat Lanjut</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-blue-400 font-medium">
                    &copy; {new Date().getFullYear()} Anugerah Computer. Hak Cipta Dilindungi.
                </div>
            </div>

            {/* Panel Kanan: Form Autentikasi */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 sm:p-12 relative bg-slate-50 dark:bg-zinc-950">
                
                {/* Logo Mobile (Hanya terlihat di layar HP) */}
                <Link
                    href={home()}
                    className="flex lg:hidden flex-col items-center gap-4 mb-8 font-medium group transition-transform hover:scale-105"
                >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg ring-4 ring-white dark:ring-zinc-900">
                        <AppLogoIcon className="size-10 fill-current" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Anugerah ERP
                        </h1>
                    </div>
                </Link>

                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                            {title}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {description}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 dark:border-zinc-800 dark:shadow-none">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
