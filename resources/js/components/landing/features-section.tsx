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

export function FeaturesSection({ features }: { features: any[] }) {
    return (
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
    );
}
