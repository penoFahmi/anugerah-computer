import { Head, router } from '@inertiajs/react';
import { MapPin, Phone, CheckCircle2, Star, Laptop, X, ChevronRight, Sparkles, MessageCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FloatingChatbot } from '@/components/chatbot/floating-chatbot';
import { Button } from '@/components/ui/button';
import { ProductList } from '@/components/landing/product-list';
import { LandingProps } from '@/types/landing';
import { useState, useEffect, useRef } from 'react';

const defaultStore = {
    store_name: 'Anugerah Computer',
    hero_headline: 'Solusi Cerdas untuk Laptop Second & Servis',
    hero_description: 'Pusat jual beli laptop second berkualitas dan jasa servis profesional di Pontianak. Dapatkan performa terbaik dengan harga yang bersahabat.',
    address: 'Jl. Sepakat 2 No 79, Pontianak, Kalimantan Barat',
    phone: '+62 821-5485-3612',
    whatsapp_url: 'https://wa.me/6282154853612',
    open_hours: 'Buka Setiap Hari (09.00 - 21.00 WIB)',
    logo_path: null,
    slider_images: [],
    services: [
        { id: 1, title: 'Servis Hardware & Software', description: 'Mati total, ganti LCD, keyboard, hingga instalasi ulang OS dan aplikasi pendukung.', icon: 'Wrench' },
        { id: 2, title: 'Tukar Tambah', description: 'Upgrade laptop lama Anda ke spesifikasi yang lebih tinggi dengan sistem tukar tambah.', icon: 'RefreshCw' },
        { id: 3, title: 'Jual Beli Laptop Second', description: 'Unit laptop second pilihan, sudah melalui serangkaian Quality Control ketat.', icon: 'ShieldCheck' }
    ],
    features: [
        { title: 'Teknisi Berpengalaman', description: 'Ditangani langsung oleh ahli tersertifikasi.', icon: 'CheckCircle2' },
        { title: 'Sparepart Original', description: 'Suku cadang berkualitas & bergaransi.', icon: 'ShieldCheck' },
        { title: 'Harga Transparan', description: 'Tanpa biaya tersembunyi di awal.', icon: 'Tag' },
        { title: 'Garansi Servis', description: 'Kepuasan terjamin dengan purna jual.', icon: 'Award' },
    ],
    map_embed_url: '',
    facebook_url: '',
    instagram_url: '',
    tiktok_url: '',
    youtube_url: '',
    hero_badge: 'Pusat Layanan Terpercaya di Pontianak',
    hero_headline_highlight: 'Laptop & Servis'
};

const fadeUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function LandingPage({ products = [], store: dbStore, testimonials = [] }: LandingProps & { testimonials?: any[] }) {
    const store = dbStore || defaultStore;
    const services = Array.isArray(store.services) && store.services.length > 0 ? store.services : defaultStore.services;
    const features = Array.isArray(store.features) && store.features.length > 0 ? store.features : defaultStore.features;
    const sliderImages = Array.isArray(store.slider_images) ? store.slider_images : [];

    const [currentSlide, setCurrentSlide] = useState(0);
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    useEffect(() => {
        if (sliderImages.length > 1) {
            const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % sliderImages.length), 5000);
            return () => clearInterval(timer);
        }
    }, [sliderImages]);

    const [isTestiModalOpen, setIsTestiModalOpen] = useState(false);
    const [testiForm, setTestiForm] = useState({ name: '', role: '', text: '', rating: 5 });
    
    const submitTestimonial = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/testimonials', testiForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsTestiModalOpen(false);
                setTestiForm({ name: '', role: '', text: '', rating: 5 });
            }
        });
    };

    const renderIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName] || LucideIcons.Laptop;
        return <Icon className="h-6 w-6" />;
    };

    return (
        <div className="dark relative min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
            <Head title={`Beranda | ${store.store_name}`} />

            {/* Glowing Abstract Background Elements */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute -top-[20%] -left-[10%] h-[1000px] w-[1000px] rounded-full bg-primary/15 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-primary/20 blur-[150px]" />
            </div>

            {/* Premium Floating Navbar */}
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

            {/* Hero Section */}
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
                        <span className="text-sm font-medium text-primary">{store.hero_badge || defaultStore.hero_badge}</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tighter text-foreground sm:text-7xl md:text-8xl"
                    >
                        {store.hero_headline || defaultStore.hero_headline} <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent">
                            {store.hero_headline_highlight || defaultStore.hero_headline_highlight}
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

            {/* Keunggulan Kami */}
            <section id="keunggulan" className="py-32 relative z-10">
                <div className="container mx-auto px-4 md:px-6">
                    <motion.div 
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="mb-20 text-center"
                    >
                        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Kenapa Memilih Kami?</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Dedikasi kami untuk memberikan pelayanan terbaik bagi Anda.</p>
                    </motion.div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature: any, i: number) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="relative z-10">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-inner shadow-primary/20 ring-1 ring-primary/30 transition-transform group-hover:scale-110">
                                        {renderIcon(feature.icon)}
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Layanan Kami */}
            <section id="layanan" className="py-32 relative z-10">
                <div className="container mx-auto px-4 md:px-6">
                    <motion.div 
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="mb-20 text-center"
                    >
                        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Layanan Kami</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Solusi menyeluruh untuk segala kebutuhan komputasi Anda, dari perbaikan ringan hingga upgrade total.</p>
                    </motion.div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map((svc: any, i: number) => (
                            <motion.div
                                key={svc.id || i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:bg-white/10 hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)]"
                            >
                                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/30 blur-[50px] transition-all duration-500 group-hover:bg-primary/50" />
                                <div className="relative z-10">
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/20">
                                        {renderIcon(svc.icon)}
                                    </div>
                                    <h3 className="mb-4 text-2xl font-bold text-foreground">{svc.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {svc.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dynamic Catalog Section */}
            <section id="katalog" className="py-32 relative z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent z-0" />
                <div className="relative z-10">
                    <ProductList products={products} />
                </div>
            </section>

            {/* Location & CTA Section */}
            <section id="lokasi" className="py-32 relative z-10">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)]">
                        <div className="grid lg:grid-cols-2">
                            {/* Left: Info */}
                            <div className="flex flex-col justify-center p-10 md:p-16 lg:p-20">
                                <h2 className="mb-8 text-4xl font-extrabold tracking-tight sm:text-5xl">Kunjungi Kami</h2>
                                <ul className="space-y-8 text-lg text-muted-foreground">
                                    <li className="flex items-start gap-6">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-primary shadow-inner">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div className="pt-2">
                                            <h4 className="text-white font-semibold mb-1">Alamat</h4>
                                            <span className="leading-relaxed">{store.address}</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-6">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-primary shadow-inner">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <div className="pt-2">
                                            <h4 className="text-white font-semibold mb-1">Telepon & WhatsApp</h4>
                                            <span>{store.phone}</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-6">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-primary shadow-inner">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                        <div className="pt-2">
                                            <h4 className="text-white font-semibold mb-1">Jam Operasional</h4>
                                            <span>{store.open_hours}</span>
                                        </div>
                                    </li>
                                </ul>
                                
                                <div className="mt-12">
                                    <Button size="lg" asChild className="h-14 w-full sm:w-auto rounded-full bg-green-600 px-8 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-green-500 hover:shadow-green-500/25">
                                        <a href={store.whatsapp_url} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                                            <MessageCircle className="h-5 w-5" />
                                            Chat via WhatsApp Sekarang
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            {/* Right: Map */}
                            <div className="relative min-h-[400px] lg:min-h-full bg-black/20 p-4 md:p-8">
                                {store.map_embed_url ? (
                                    <div className="h-full w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                                        <iframe 
                                            src={store.map_embed_url} 
                                            className="w-full h-full min-h-[400px] bg-zinc-900 grayscale contrast-125 opacity-80 transition-all hover:grayscale-0 hover:opacity-100"
                                            style={{ border: 0 }} 
                                            allowFullScreen 
                                            loading="lazy" 
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-3xl border border-white/10 border-dashed bg-white/5">
                                        <div className="text-center text-muted-foreground">
                                            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>Lokasi Peta Belum Diatur</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimoni Pelanggan */}
            <section className="py-32 relative z-10">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mb-20 flex flex-col md:flex-row justify-between items-end gap-6">
                        <motion.div 
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            variants={fadeUp}
                        >
                            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Kata Mereka</h2>
                            <p className="mt-4 text-lg text-muted-foreground">Ribuan pelanggan telah membuktikan kualitas layanan kami.</p>
                        </motion.div>
                        <Button onClick={() => setIsTestiModalOpen(true)} variant="outline" className="h-12 rounded-full border-primary/30 px-8 hover:bg-primary/10 hover:text-primary">
                            Tulis Ulasan Anda
                        </Button>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-3">
                        {testimonials.length > 0 ? testimonials.map((testi, i) => (
                            <motion.div 
                                key={testi.id || i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all hover:bg-white/10 shadow-lg"
                            >
                                <div>
                                    <div className="flex gap-1 text-primary mb-6">
                                        {[...Array(5)].map((_, j) => <Star key={j} className={`h-5 w-5 ${j < testi.rating ? 'fill-current' : 'text-white/10'}`} />)}
                                    </div>
                                    <p className="mb-8 text-muted-foreground italic leading-relaxed">"{testi.text}"</p>
                                </div>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center font-bold text-white shadow-lg">
                                        {testi.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">{testi.name}</h4>
                                        <p className="text-sm text-muted-foreground">{testi.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 text-center text-muted-foreground bg-card/20 rounded-3xl border border-white/5">
                                Belum ada ulasan yang ditampilkan. Jadilah yang pertama!
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-background pt-20 pb-24 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid gap-12 md:grid-cols-2 items-center">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-3">
                                {store.logo_path ? (
                                    <img src={store.logo_path} alt={store.store_name} className="h-8 w-auto object-contain" />
                                ) : (
                                    <Laptop className="h-6 w-6 text-primary" />
                                )}
                                {store.store_name}
                            </h3>
                            <p className="text-muted-foreground max-w-sm mx-auto md:mx-0">Solusi cerdas untuk jual beli laptop second berkualitas dan jasa servis profesional.</p>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-6 md:pr-24 pb-16 md:pb-0">
                            <div className="flex gap-4">
                                {store.facebook_url && (
                                    <a href={store.facebook_url} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary hover:border-primary/30 shadow-inner">
                                        {renderIcon('Facebook')}
                                    </a>
                                )}
                                {store.instagram_url && (
                                    <a href={store.instagram_url} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary hover:border-primary/30 shadow-inner">
                                        {renderIcon('Instagram')}
                                    </a>
                                )}
                                {store.tiktok_url && (
                                    <a href={store.tiktok_url} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary hover:border-primary/30 shadow-inner">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-.71 4.46-2.1 6.22-1.73 2.24-4.12 3.42-6.96 3.41-4.18-.02-7.23-3.26-7.39-7.42-.16-3.96 2.45-7.53 6.32-8.35 1.24-.26 2.52-.16 3.76.12v4.21c-.81-.39-1.78-.51-2.67-.35-1.28.23-2.3 1.25-2.58 2.53-.33 1.49.2 3.1 1.48 4.01 1.24.89 3.01.99 4.36.27 1.34-.73 2.1-2.19 2.1-3.73V.02z" />
                                        </svg>
                                    </a>
                                )}
                                {store.youtube_url && (
                                    <a href={store.youtube_url} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary hover:border-primary/30 shadow-inner">
                                        {renderIcon('Youtube')}
                                    </a>
                                )}
                            </div>
                            <a href="/login" className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-all shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:border-primary/50 hover:shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)]">
                                Masuk Dasbor Admin
                                <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                            </a>
                            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {store.store_name}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>

            <FloatingChatbot />

            {/* Modal Tulis Testimoni */}
            <AnimatePresence>
                {isTestiModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTestiModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 backdrop-blur-2xl p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)]"
                        >
                            <button onClick={() => setIsTestiModalOpen(false)} className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Tulis Ulasan Anda</h3>
                                <p className="text-muted-foreground">Bagikan pengalaman Anda menggunakan layanan kami.</p>
                            </div>
                            <form onSubmit={submitTestimonial} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-300">Nama Lengkap</label>
                                    <input required type="text" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" placeholder="Masukkan nama..." value={testiForm.name} onChange={e => setTestiForm({...testiForm, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-300">Pekerjaan / Instansi (Opsional)</label>
                                    <input type="text" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" placeholder="Contoh: Mahasiswa UNTAN" value={testiForm.role} onChange={e => setTestiForm({...testiForm, role: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-300">Penilaian</label>
                                    <div className="flex gap-2 text-primary cursor-pointer">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} key={star} onClick={() => setTestiForm({...testiForm, rating: star})}>
                                                <Star className={`h-8 w-8 ${star <= testiForm.rating ? 'fill-current' : 'text-white/10'}`} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-300">Ulasan</label>
                                    <textarea required rows={4} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none" placeholder="Ceritakan pengalaman Anda..." value={testiForm.text} onChange={e => setTestiForm({...testiForm, text: e.target.value})}></textarea>
                                </div>
                                <Button type="submit" size="lg" className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-lg shadow-[0_0_20px_-5px_rgba(var(--primary),0.4)]">
                                    Kirim Ulasan
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
