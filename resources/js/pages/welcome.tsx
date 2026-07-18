import { Head } from '@inertiajs/react';
import { MapPin, Laptop, Wrench, RefreshCw, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FloatingChatbot } from '@/components/chatbot/floating-chatbot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductList } from '@/components/landing/product-list';
import { LandingProps } from '@/types/landing';

export default function LandingPage({ products = [] }: LandingProps) {
    return (
        <div className="relative min-h-screen bg-slate-50 font-sans text-slate-900">
            <Head title="Beranda | Anugerah Computer" />

            {/* Navbar */}
            <nav className="sticky top-0 z-40 w-full border-b bg-white/80 shadow-sm backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-blue-600">
                        <Laptop className="h-6 w-6" />
                        <span>Anugerah Computer</span>
                    </div>
                    <div className="hidden gap-6 text-sm font-medium md:flex">
                        <a href="#layanan" className="transition-colors hover:text-blue-600">Layanan</a>
                        <a href="#katalog" className="transition-colors hover:text-blue-600">Katalog Laptop</a>
                        <a href="#lokasi" className="transition-colors hover:text-blue-600">Lokasi</a>
                    </div>
                    <Button asChild className="rounded-full font-semibold">
                        <a href="/login">Masuk Sistem</a>
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center md:px-6 md:py-32 lg:py-40">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
                    Solusi Cerdas untuk <br className="hidden sm:block" />
                    <span className="text-blue-600">Laptop Second & Servis</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
                    Pusat jual beli laptop second berkualitas dan jasa servis profesional di Pontianak. 
                    Dapatkan performa terbaik dengan harga yang bersahabat.
                </p>
                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                    <Button size="lg" asChild className="rounded-full shadow-lg transition-all hover:shadow-xl font-semibold">
                        <a href="#katalog">Lihat Stok Laptop</a>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="rounded-full bg-white font-semibold hover:bg-slate-50">
                        <a href="#layanan">Layanan Servis</a>
                    </Button>
                </div>
            </section>

            {/* Services Section */}
            <section id="layanan" className="bg-white py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Layanan Kami</h2>
                        <p className="mt-4 text-slate-600">Solusi menyeluruh untuk segala kebutuhan komputasi Anda.</p>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="border-none bg-slate-50 shadow-md transition-colors hover:bg-slate-100">
                            <CardHeader>
                                <Wrench className="mb-4 h-10 w-10 text-blue-600" />
                                <CardTitle>Servis Hardware & Software</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base text-slate-600">
                                    Mati total, ganti LCD, keyboard, hingga instalasi ulang OS dan aplikasi pendukung.
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-slate-50 shadow-md transition-colors hover:bg-slate-100">
                            <CardHeader>
                                <RefreshCw className="mb-4 h-10 w-10 text-blue-600" />
                                <CardTitle>Tukar Tambah</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base text-slate-600">
                                    Upgrade laptop lama Anda ke spesifikasi yang lebih tinggi dengan sistem tukar tambah yang adil.
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-slate-50 shadow-md transition-colors hover:bg-slate-100">
                            <CardHeader>
                                <ShieldCheck className="mb-4 h-10 w-10 text-blue-600" />
                                <CardTitle>Jual Beli Laptop Second</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base text-slate-600">
                                    Unit laptop second pilihan, sudah melalui Quality Control ketat dan bergaransi toko.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Dynamic Catalog Section */}
            <ProductList products={products} />

            {/* Location & CTA Section */}
            <section id="lokasi" className="bg-blue-900 py-20 text-white">
                <div className="container mx-auto flex flex-col items-center justify-between gap-12 px-4 text-center md:px-6 lg:flex-row lg:text-left">
                    <div className="max-w-2xl">
                        <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">Kunjungi Toko Kami</h2>
                        <ul className="space-y-4 text-lg text-blue-100">
                            <li className="flex items-center justify-center gap-3 lg:justify-start">
                                <MapPin className="h-6 w-6 text-blue-400" />
                                <span>Jl. Sepakat 2, Pontianak, Kalimantan Barat</span>
                            </li>
                            <li className="flex items-center justify-center gap-3 lg:justify-start">
                                <Phone className="h-6 w-6 text-blue-400" />
                                <span>+62 8XX-XXXX-XXXX</span>
                            </li>
                            <li className="flex items-center justify-center gap-3 lg:justify-start">
                                <CheckCircle2 className="h-6 w-6 text-blue-400" />
                                <span>Buka Senin - Sabtu (09.00 - 21.00 WIB)</span>
                            </li>
                        </ul>
                    </div>
                    <div className="w-full lg:w-auto">
                        <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">Punya Pertanyaan?</CardTitle>
                                <CardDescription className="text-blue-100">Konsultasikan kerusakan atau cek stok unit via WhatsApp.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button size="lg" className="w-full bg-green-500 font-semibold text-white hover:bg-green-600">
                                    Chat via WhatsApp
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-slate-50 py-8">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500 md:px-6">
                    <p>&copy; {new Date().getFullYear()} Anugerah Computer. All rights reserved.</p>
                </div>
            </footer>

            {/* Komponen Chatbot Dipanggil Di Sini, Terisolasi Bebas Re-render! */}
            <FloatingChatbot />
        </div>
    );
}