import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { Wrench, Laptop, MessageSquare, ShieldCheck, ArrowRight, Laptop2 } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props as any;

    return (
        <>
            <Head title="Anugerah Computer - Servis & Jual Beli Laptop Second">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                
                {/* ==================== NAVBAR SECTION ==================== */}
                <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md px-6 py-4 dark:border-neutral-900 dark:bg-[#0a0a0a]/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        {/* Logo Identitas */}
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f53003] text-white font-bold text-lg shadow-sm">
                                AC
                            </div>
                            <span className="font-bold tracking-tight text-lg">Anugerah Computer</span>
                        </div>

                        {/* Navigasi Auth: Login Admin & Pegawai */}
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b1b18] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-black dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white transition-colors"
                                >
                                    Masuk Dashboard <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-5 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-800 dark:bg-[#161615] dark:text-neutral-300 dark:hover:bg-neutral-900 transition-colors"
                                >
                                    Login Karyawan / Admin
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ==================== HERO SECTION ==================== */}
                <main className="flex-1">
                    <section className="mx-auto max-w-7xl px-6 pt-16 pb-12 text-center lg:pt-28 lg:pb-20">
                        <div className="mx-auto max-w-3xl space-y-6">
                            <BadgePromo />
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                                Solusi Perbaikan & Jual Beli Laptop Terbaik
                            </h1>
                            <p className="mx-auto max-w-2xl text-base text-[#706f6c] sm:text-lg dark:text-[#A1A09A]">
                                Sistem Manajemen Servis Terintegrasi Anugerah Computer. Pantau status reparasi dan transaksi secara real-time.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                                {auth.user ? (
                                    <Link href={dashboard()} className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-[#f53003] px-8 py-3 text-base font-semibold text-white shadow-md hover:bg-[#d62700] transition-colors">
                                        Buka Sistem Utama
                                    </Link>
                                ) : (
                                    <Link href={login()} className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-[#f53003] px-8 py-3 text-base font-semibold text-white shadow-md hover:bg-[#d62700] transition-colors">
                                        Mulai Kelola Servis
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ==================== CORE SERVICES SECTION ==================== */}
                    <section className="border-t border-neutral-100 bg-neutral-50/50 py-16 dark:border-neutral-900 dark:bg-[#111110]/30">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                
                                {/* Layanan 1: Servis */}
                                <div className="rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-sm dark:border-neutral-800/60 dark:bg-[#161615]">
                                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#f53003] dark:bg-red-950/30 dark:text-[#FF4433]">
                                        <Wrench className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold">Reparasi & Servis Laptop</h3>
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                                        Penanganan penggantian sparepart, perbaikan motherboard, pembersihan thermal paste, hingga instalasi software bergaransi resmi toko.
                                    </p>
                                </div>

                                {/* Layanan 2: Jual Beli Second */}
                                <div className="rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-sm dark:border-neutral-800/60 dark:bg-[#161615]">
                                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                                        <Laptop className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold">Jual Beli Laptop Bekas</h3>
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                                        Kami menerima tukar tambah atau beli laptop bekas Anda dengan harga tinggi dan transparan, lengkap dengan modul pemeriksaan KTP pengaman.
                                    </p>
                                </div>

                                {/* Layanan 3: WA Gateway / AI */}
                                <div className="rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-sm dark:border-neutral-800/60 dark:bg-[#161615] md:col-span-2 lg:col-span-1">
                                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400">
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold">Notifikasi Otomatis WA</h3>
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                                        Sistem terhubung langsung dengan WhatsApp Gateway untuk mengirimkan nota digital, estimasi harga, dan konfirmasi pengerjaan otomatis kepada pelanggan.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* ==================== FOOTER VALUE PROPOSITION ==================== */}
                    <section className="mx-auto max-w-7xl px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#706f6c] dark:text-[#A1A09A] border-t border-neutral-100 dark:border-neutral-900">
                        <div className="flex items-center gap-1.5 font-medium">
                            <ShieldCheck className="h-4 w-4 text-green-600" /> Enterprise Service Station &copy; {new Date().getFullYear()} Anugerah Computer
                        </div>
                        <div className="flex gap-4">
                            <span>Pontianak, Indonesia</span>
                        </div>
                    </section>
                </main>

            </div>
        </>
    );
}

// Komponen hiasan pemanis layout di atas judul utama
function BadgePromo() {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
            <Laptop2 className="h-3.5 w-3.5 text-[#f53003]" /> Versi Aplikasi Sistem v1.0.0
        </span>
    );
}