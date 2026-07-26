import { MapPin, Phone, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LocationSection({ store }: { store: any }) {
    return (
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
    );
}
