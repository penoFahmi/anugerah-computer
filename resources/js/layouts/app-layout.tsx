import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import { useEcho } from '@laravel/echo-react';
import { toast } from 'sonner';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    
    useFlashToast();

    useEcho('admin.notifications', '.chat.requires_human', (e: any) => {
        const phone = e.chatLog?.phone || 'Pelanggan';
        toast.error(`🔔 ${phone} butuh bantuan manusia!`, { 
            duration: Infinity, 
            description: e.chatLog?.message || 'Sistem AI meminta bantuan Admin/Kasir.',
            action: {
                label: 'Lihat',
                onClick: () => {
                    // Jika ada logic link ke chat
                    window.location.href = `/kanban`; 
                }
            }
        });
    });

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
