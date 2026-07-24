import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import { GlobalChatWidget } from '@/components/services/global-chat-widget';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    useFlashToast();

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
            <GlobalChatWidget />
        </AppLayoutTemplate>
    );
}
