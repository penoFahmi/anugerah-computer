import { AppContent } from '@/components/dashboard/app-content';
import { AppShell } from '@/components/dashboard/app-shell';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { AppSidebarHeader } from '@/components/dashboard/app-sidebar-header';
import { MessageSquare } from 'lucide-react';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
