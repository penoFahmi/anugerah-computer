import { Laptop, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const renderIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Laptop;
    return <Icon className="h-6 w-6" />;
};

export function Footer({ store }: { store: any }) {
    return (
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
    );
}
