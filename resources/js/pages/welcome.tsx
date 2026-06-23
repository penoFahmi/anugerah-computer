import { Head } from '@inertiajs/react';
import {
    MapPin,
    Laptop,
    Wrench,
    RefreshCw,
    Phone,
    ShieldCheck,
    CheckCircle2,
    MessageCircle,
    X,
    Send,
    Bot,
    User,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LandingPage({ products = [] }) {
    // Data statis sementara sebelum CRUD manual di backend selesai
    const featuredLaptops =
        products.length > 0
            ? products
            : [
                  {
                      id: 1,
                      name: 'Lenovo ThinkPad T490',
                      specs: 'Core i5 Gen 8, 8GB RAM, 256GB SSD',
                      price: 'Rp 4.500.000',
                      status: 'Ready',
                  },
                  {
                      id: 2,
                      name: 'MacBook Air 2017',
                      specs: 'Core i5, 8GB RAM, 128GB SSD',
                      price: 'Rp 5.200.000',
                      status: 'Ready',
                  },
                  {
                      id: 3,
                      name: 'Asus VivoBook 14',
                      specs: 'Ryzen 3, 8GB RAM, 512GB SSD',
                      price: 'Rp 4.800.000',
                      status: 'Terjual',
                  },
              ];

    // ==========================================
    // STATE & LOGIKA CHATBOT (JEMBATAN NLP)
    // ==========================================
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: 'Halo! Saya Asisten AI Anugerah Computer. Ada yang bisa saya bantu terkait harga laptop atau keluhan servis?',
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll ke pesan terbaru
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userText = chatInput;
        setMessages((prev) => [...prev, { role: 'user', text: userText }]);
        setChatInput('');
        setIsTyping(true);

        // SIMULASI NLP BACKEND (Akan diganti dengan fetch API ke backend Skripsi nanti)
        setTimeout(() => {
            let botReply = '';
            const lowerInput = userText.toLowerCase();

            if (lowerInput.includes('garansi')) {
                botReply =
                    'Tentu! Semua laptop second di Anugerah Computer bergaransi toko selama 1 bulan penuh, meliputi hardware dan software.';
            } else if (
                lowerInput.includes('servis') ||
                lowerInput.includes('rusak') ||
                lowerInput.includes('mati')
            ) {
                botReply =
                    'Untuk keluhan kerusakan, estimasi biaya baru bisa dipastikan setelah teknisi kami melakukan pengecekan unit. Silakan bawa laptopnya ke toko ya kak!';
            } else if (
                lowerInput.includes('lokasi') ||
                lowerInput.includes('alamat')
            ) {
                botReply =
                    'Toko kami berlokasi di Jl. Sepakat 2, Pontianak. Buka setiap hari Senin-Sabtu jam 09.00 - 21.00 WIB.';
            } else {
                // Jawaban cerdas untuk skripsi jika kata kunci tidak dikenali
                botReply =
                    'Pertanyaan yang menarik! Saat ini saya masih dalam tahap pelatihan model NLP (Skripsi Mode). Untuk info lebih detail, kakak bisa klik tombol "Hubungi Kami" untuk chat langsung dengan Admin ya.';
            }

            setMessages((prev) => [...prev, { role: 'bot', text: botReply }]);
            setIsTyping(false);
        }, 1200); // Jeda 1.2 detik biar terkesan AI sedang "berpikir"
    };

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
                        <a
                            href="#layanan"
                            className="transition-colors hover:text-blue-600"
                        >
                            Layanan
                        </a>
                        <a
                            href="#katalog"
                            className="transition-colors hover:text-blue-600"
                        >
                            Katalog Laptop
                        </a>
                        <a
                            href="#lokasi"
                            className="transition-colors hover:text-blue-600"
                        >
                            Lokasi
                        </a>
                    </div>
                    <Button asChild className="rounded-full">
                        <a
                            href="https://wa.me/628xxxxxxxxxx"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Hubungi Kami
                        </a>
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center md:px-6 md:py-32 lg:py-40">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
                    Solusi Cerdas untuk <br className="hidden sm:block" />
                    <span className="text-blue-600">
                        Laptop Second & Servis
                    </span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
                    Pusat jual beli laptop second berkualitas dan jasa servis
                    profesional di Pontianak. Dapatkan performa terbaik dengan
                    harga yang bersahabat.
                </p>
                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                        size="lg"
                        asChild
                        className="rounded-full shadow-lg transition-all hover:shadow-xl"
                    >
                        <a href="#katalog">Lihat Stok Laptop</a>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="rounded-full bg-white"
                    >
                        <a href="#layanan">Layanan Servis</a>
                    </Button>
                </div>
            </section>

            {/* Services Section */}
            <section id="layanan" className="bg-white py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Layanan Kami
                        </h2>
                        <p className="mt-4 text-slate-600">
                            Solusi menyeluruh untuk segala kebutuhan komputasi
                            Anda.
                        </p>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="border-none bg-slate-50 shadow-md transition-colors hover:bg-slate-100">
                            <CardHeader>
                                <Wrench className="mb-4 h-10 w-10 text-blue-600" />
                                <CardTitle>
                                    Servis Hardware & Software
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base text-slate-600">
                                    Mati total, ganti LCD, keyboard, hingga
                                    instalasi ulang OS dan aplikasi pendukung.
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
                                    Upgrade laptop lama Anda ke spesifikasi yang
                                    lebih tinggi dengan sistem tukar tambah yang
                                    adil.
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
                                    Unit laptop second pilihan, sudah melalui
                                    Quality Control ketat dan bergaransi toko.
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
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Laptop Pilihan
                            </h2>
                            <p className="mt-2 text-slate-600">
                                Stok terbaru, siap pakai untuk kerja, kuliah,
                                atau sekolah.
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            className="mt-4 text-blue-600 md:mt-0"
                        >
                            Lihat Semua &rarr;
                        </Button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {featuredLaptops.map((laptop) => (
                            <Card
                                key={laptop.id}
                                className="flex flex-col justify-between overflow-hidden"
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-xl">
                                            {laptop.name}
                                        </CardTitle>
                                        {laptop.status === 'Ready' ? (
                                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                                                Ready
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-500/10 ring-inset">
                                                Terjual
                                            </span>
                                        )}
                                    </div>
                                    <CardDescription className="mt-2 line-clamp-2 text-slate-600">
                                        {laptop.specs}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-auto flex items-center justify-between pt-0">
                                    <span className="text-lg font-bold text-slate-900">
                                        {laptop.price}
                                    </span>
                                    <Button
                                        disabled={laptop.status !== 'Ready'}
                                        size="sm"
                                    >
                                        {laptop.status === 'Ready'
                                            ? 'Detail'
                                            : 'Habis'}
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
                        <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                            Kunjungi Toko Kami
                        </h2>
                        <ul className="space-y-4 text-lg text-blue-100">
                            <li className="flex items-center justify-center gap-3 lg:justify-start">
                                <MapPin className="h-6 w-6 text-blue-400" />
                                <span>
                                    Jl. Sepakat 2, Pontianak, Kalimantan Barat
                                </span>
                            </li>
                            <li className="flex items-center justify-center gap-3 lg:justify-start">
                                <Phone className="h-6 w-6 text-blue-400" />
                                <span>+62 8XX-XXXX-XXXX</span>
                            </li>
                            <li className="flex items-center justify-center gap-3 lg:justify-start">
                                <CheckCircle2 className="h-6 w-6 text-blue-400" />
                                <span>
                                    Buka Senin - Sabtu (09.00 - 21.00 WIB)
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="w-full lg:w-auto">
                        <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">
                                    Punya Pertanyaan?
                                </CardTitle>
                                <CardDescription className="text-blue-100">
                                    Konsultasikan kerusakan atau cek stok unit
                                    via WhatsApp.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    size="lg"
                                    className="w-full bg-green-500 font-semibold text-white hover:bg-green-600"
                                >
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
                    <p>
                        &copy; {new Date().getFullYear()} Anugerah Computer. All
                        rights reserved.
                    </p>
                </div>
            </footer>

            {/* ========================================== */}
            {/* WIDGET FLOATING CHATBOT (AI SKRIPSI) */}
            {/* ========================================== */}
            <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
                {/* Jendela Chat */}
                {isChatOpen && (
                    <Card className="mb-4 w-[350px] animate-in border-slate-200 shadow-2xl slide-in-from-bottom-5 fade-in">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 rounded-t-xl bg-blue-600 px-4 py-3 text-white">
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                <div>
                                    <CardTitle className="text-base text-white">
                                        Tanya AI Assistant
                                    </CardTitle>
                                    <CardDescription className="text-xs text-blue-100">
                                        Sedang Online
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white hover:bg-blue-700"
                                onClick={() => setIsChatOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>

                        {/* Area Pesan */}
                        <CardContent className="flex h-[300px] flex-col gap-3 overflow-y-auto bg-slate-50 p-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div
                                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${msg.role === 'bot' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}
                                    >
                                        {msg.role === 'bot' ? (
                                            <Bot className="h-4 w-4" />
                                        ) : (
                                            <User className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user' ? 'rounded-tr-none bg-blue-600 text-white' : 'rounded-tl-none border bg-white text-slate-700'}`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex flex-row gap-2">
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="flex max-w-[80%] items-center gap-1 rounded-2xl rounded-tl-none border bg-white px-4 py-3 text-sm text-slate-500">
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></span>
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 delay-75"></span>
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 delay-150"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </CardContent>

                        {/* Input Chat */}
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-2 rounded-b-xl border-t bg-white p-3"
                        >
                            <Input
                                placeholder="Tanya seputar servis atau harga..."
                                className="flex-1 focus-visible:ring-blue-600"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={!chatInput.trim() || isTyping}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </Card>
                )}

                {/* Tombol Floating */}
                <Button
                    size="lg"
                    className="h-14 w-14 rounded-full bg-blue-600 shadow-2xl hover:bg-blue-700"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                >
                    {isChatOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <MessageCircle className="h-6 w-6" />
                    )}
                </Button>
            </div>
        </div>
    );
}
