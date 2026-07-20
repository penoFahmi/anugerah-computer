import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import { useEcho } from '@laravel/echo-react';
import { toast } from 'sonner';
import { GlobalChatModal } from '@/components/services/global-chat-modal';

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
                label: 'Balas',
                onClick: () => {
                    window.dispatchEvent(new CustomEvent('open-global-chat', { detail: { phone } }));
                }
            }
        });
    });

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
            <GlobalChatModal />
        </AppLayoutTemplate>
    );
}
