import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

const fadeUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const renderIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Laptop;
    return <Icon className="h-6 w-6" />;
};

export function ServicesSection({ services }: { services: any[] }) {
    return (
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
    );
}
