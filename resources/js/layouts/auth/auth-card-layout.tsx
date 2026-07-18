import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {

    useFlashToast();

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-slate-50 p-6 md:p-10 dark:bg-zinc-950">
            <div className="flex w-full max-w-[28rem] flex-col gap-8">
                <Link
                    href={home()}
                    className="flex flex-col items-center gap-4 self-center font-medium group transition-transform hover:scale-105"
                >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg ring-4 ring-white dark:ring-zinc-900">
                        <AppLogoIcon className="size-12 fill-current" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Anugerah Computer
                        </h1>
                        <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">
                            Workspace System
                        </p>
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-2xl border-slate-200/60 shadow-xl overflow-hidden bg-white/70 backdrop-blur-xl dark:bg-zinc-900/80 dark:border-zinc-800">
                        <CardHeader className="px-10 pt-10 pb-2 text-center">
                            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                            <CardDescription className="text-sm mt-2 font-medium">{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 pb-10 pt-6">
                            {children}
                        </CardContent>
                    </Card>
                </div>
                
                <div className="text-center text-xs font-medium text-slate-400">
                    &copy; {new Date().getFullYear()} Anugerah Computer. Hak Cipta Dilindungi.
                </div>
            </div>
        </div>
    );
}
