import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FloatingChatbot } from '@/components/chatbot/floating-chatbot';
import { ProductList } from '@/components/landing/product-list';
import { LandingProps } from '@/types/landing';

// Diimpor dari komponen hasil ekstraksi
import { Navbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { ServicesSection } from '@/components/landing/services-section';
import { LocationSection } from '@/components/landing/location-section';
import { TestimonialSection } from '@/components/landing/testimonial-section';
import { Footer } from '@/components/landing/footer';

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

export default function LandingPage({ products = [], store: dbStore, testimonials = [] }: LandingProps & { testimonials?: any[] }) {
    const store = dbStore || defaultStore;
    const services = Array.isArray(store.services) && store.services.length > 0 ? store.services : defaultStore.services;
    const features = Array.isArray(store.features) && store.features.length > 0 ? store.features : defaultStore.features;
    const sliderImages = Array.isArray(store.slider_images) ? store.slider_images : [];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (sliderImages.length > 1) {
            const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % sliderImages.length), 5000);
            return () => clearInterval(timer);
        }
    }, [sliderImages]);

    return (
        <div className="dark relative min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
            <Head title={`Beranda | ${store.store_name}`} />

            {/* Glowing Abstract Background Elements */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute -top-[20%] -left-[10%] h-[1000px] w-[1000px] rounded-full bg-primary/15 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-primary/20 blur-[150px]" />
            </div>

            <Navbar store={store} />

            <HeroSection store={store} sliderImages={sliderImages} currentSlide={currentSlide} />
            <FeaturesSection features={features} />
            <ServicesSection services={services} />
            
            {/* Dynamic Catalog Section */}
            <section id="katalog" className="py-32 relative z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent z-0" />
                <div className="relative z-10">
                    <ProductList products={products} />
                </div>
            </section>
            
            <LocationSection store={store} />
            <TestimonialSection testimonials={testimonials} />
            <Footer store={store} />

            <FloatingChatbot />
        </div>
    );
}
