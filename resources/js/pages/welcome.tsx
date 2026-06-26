import { Head } from '@inertiajs/react';
import { MapPin, Laptop, Wrench, RefreshCw, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FloatingChatbot } from '@/components/chatbot/floating-chatbot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
    id: number;
    name: string;
    specs: string;
    price: string;
    status: string;
}

interface Props {
    products?: Product[];
}

export default function LandingPage({ products = [] }: Props) {
    const featuredLaptops = products.length > 0 ? products : [
        { id: 1, name: 'Lenovo ThinkPad T490', specs: 'Core i5 Gen 8, 8GB RAM, 256GB SSD', price: 'Rp 4.500.000', status: 'Ready' },
        { id: 2, name: 'MacBook Air 2017', specs: 'Core i5, 8GB RAM, 128GB SSD', price: 'Rp 5.200.000', status: 'Ready' },
        { id: 3, name: 'Asus VivoBook 14', specs: 'Ryzen 3, 8GB RAM, 512GB SSD', price: 'Rp 4.800.000', status: 'Terjual' },
    ];

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
                    <Button asChild className="rounded-full">
                        <a href="https://wa.me/628xxxxxxxxxx" target="_blank" rel="noreferrer">Hubungi Kami</a>
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
                    <Button size="lg" asChild className="rounded-full shadow-lg transition-all hover:shadow-xl">
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

            {/* Catalog/Products Section */}
            <section id="katalog" className="py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mb-12 flex flex-col items-center justify-between md:flex-row">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Laptop Pilihan</h2>
                            <p className="mt-2 text-slate-600">Stok terbaru, siap pakai untuk kerja, kuliah, atau sekolah.</p>
                        </div>
                        <Button variant="ghost" className="mt-4 text-blue-600 md:mt-0">Lihat Semua &rarr;</Button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {featuredLaptops.map((laptop) => (
                            <Card key={laptop.id} className="flex flex-col justify-between overflow-hidden">
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-xl">{laptop.name}</CardTitle>
                                        {laptop.status === 'Ready' ? (
                                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">Ready</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-500/10 ring-inset">Terjual</span>
                                        )}
                                    </div>
                                    <CardDescription className="mt-2 line-clamp-2 text-slate-600">{laptop.specs}</CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-auto flex items-center justify-between pt-0">
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