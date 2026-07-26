import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useState } from 'react';

const fadeUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export function TestimonialSection({ testimonials }: { testimonials: any[] }) {
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

    return (
        <>
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
        </>
    );
}
