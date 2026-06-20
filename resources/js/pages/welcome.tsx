import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Laptop, Wrench, RefreshCw, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LandingPage({ products = [] }) {
    // Data statis sementara sebelum CRUD manual di backend selesai
    const featuredLaptops = products.length > 0 ? products : [
        { id: 1, name: 'Lenovo ThinkPad T490', specs: 'Core i5 Gen 8, 8GB RAM, 256GB SSD', price: 'Rp 4.500.000', status: 'Ready' },
        { id: 2, name: 'MacBook Air 2017', specs: 'Core i5, 8GB RAM, 128GB SSD', price: 'Rp 5.200.000', status: 'Ready' },
        { id: 3, name: 'Asus VivoBook 14', specs: 'Ryzen 3, 8GB RAM, 512GB SSD', price: 'Rp 4.800.000', status: 'Terjual' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Head title="Beranda | Anugerah Computer" />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600">
                        <Laptop className="h-6 w-6" />
                        <span>Anugerah Computer</span>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-medium">
                        <a href="#layanan" className="hover:text-blue-600 transition-colors">Layanan</a>
                        <a href="#katalog" className="hover:text-blue-600 transition-colors">Katalog Laptop</a>
                        <a href="#lokasi" className="hover:text-blue-600 transition-colors">Lokasi</a>
                    </div>
                    <Button asChild className="rounded-full">
                        <a href="https://wa.me/628xxxxxxxxxx" target="_blank" rel="noreferrer">
                            Hubungi Kami
                        </a>
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 md:py-32 md:px-6 lg:py-40 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-slate-900">
                    Solusi Cerdas untuk <br className="hidden sm:block" />
                    <span className="text-blue-600">Laptop Second & Servis</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 md:text-xl leading-relaxed">
                    Pusat jual beli laptop second berkualitas dan jasa servis profesional di Pontianak. Dapatkan performa terbaik dengan harga yang bersahabat.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                    <Button size="lg" asChild className="rounded-full shadow-lg hover:shadow-xl transition-all">
                        <a href="#katalog">Lihat Stok Laptop</a>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="rounded-full bg-white">
                        <a href="#layanan">Layanan Servis</a>
                    </Button>
                </div>
            </section>

            {/* Services Section */}
            <section id="layanan" className="bg-white py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Layanan Kami</h2>
                        <p className="mt-4 text-slate-600">Solusi menyeluruh untuk segala kebutuhan komputasi Anda.</p>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="border-none shadow-md bg-slate-50 hover:bg-slate-100 transition-colors">
                            <CardHeader>
                                <Wrench className="h-10 w-10 text-blue-600 mb-4" />
                                <CardTitle>Servis Hardware & Software</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base text-slate-600">
                                    Mati total, ganti LCD, keyboard, hingga instalasi ulang OS dan aplikasi pendukung.
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-slate-50 hover:bg-slate-100 transition-colors">
                            <CardHeader>
                                <RefreshCw className="h-10 w-10 text-blue-600 mb-4" />
                                <CardTitle>Tukar Tambah</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base text-slate-600">
                                    Upgrade laptop lama Anda ke spesifikasi yang lebih tinggi dengan sistem tukar tambah yang adil.
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-slate-50 hover:bg-slate-100 transition-colors">
                            <CardHeader>
                                <ShieldCheck className="h-10 w-10 text-blue-600 mb-4" />
                                <CardTitle>Jual Beli Laptop Second</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base text-slate-600">
                                    Unit laptop second pilihan, sudah melalui *Quality Control* ketat dan bergaransi toko.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Catalog/Products Section */}
            <section id="katalog" className="py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Laptop Pilihan</h2>
                            <p className="mt-2 text-slate-600">Stok terbaru, siap pakai untuk kerja, kuliah, atau sekolah.</p>
                        </div>
                        <Button variant="ghost" className="mt-4 md:mt-0 text-blue-600">Lihat Semua &rarr;</Button>
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {featuredLaptops.map((laptop) => (
                            <Card key={laptop.id} className="overflow-hidden flex flex-col justify-between">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">{laptop.name}</CardTitle>
                                        {laptop.status === 'Ready' ? (
                                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                Ready
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                                Terjual
                                            </span>
                                        )}
                                    </div>
                                    <CardDescription className="mt-2 text-slate-600 line-clamp-2">
                                        {laptop.specs}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="pt-0 flex justify-between items-center mt-auto">
                                    <span className="text-lg font-bold text-slate-900">{laptop.price}</span>
                                    <Button disabled={laptop.status !== 'Ready'} size="sm">
                                        {laptop.status === 'Ready' ? 'Detail' : 'Habis'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Location & CTA Section */}
            <section id="lokasi" className="bg-blue-900 text-white py-20">
                <div className="container mx-auto px-4 md:px-6 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Kunjungi Toko Kami</h2>
                        <ul className="space-y-4 text-blue-100 text-lg">
                            <li className="flex items-center justify-center lg:justify-start gap-3">
                                <MapPin className="h-6 w-6 text-blue-400" />
                                <span>Jl. Sepakat 2, Pontianak, Kalimantan Barat</span>
                            </li>
                            <li className="flex items-center justify-center lg:justify-start gap-3">
                                <Phone className="h-6 w-6 text-blue-400" />
                                <span>+62 8XX-XXXX-XXXX</span>
                            </li>
                            <li className="flex items-center justify-center lg:justify-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-blue-400" />
                                <span>Buka Senin - Sabtu (09.00 - 21.00 WIB)</span>
                            </li>
                        </ul>
                    </div>
                    <div className="w-full lg:w-auto">
                        <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-white">
                            <CardHeader>
                                <CardTitle className="text-white text-xl">Punya Pertanyaan?</CardTitle>
                                <CardDescription className="text-blue-100">Konsultasikan kerusakan atau cek stok unit via WhatsApp.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold">
                                    Chat via WhatsApp
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-slate-50 py-8">
                <div className="container mx-auto px-4 md:px-6 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Anugerah Computer. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}