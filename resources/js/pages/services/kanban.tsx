import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { KanbanBoard } from '@/components/services/kanban-board';
import AppLayout from '@/layouts/app-layout';
import type { ServiceListItem } from '@/types/service';

interface KanbanPageProps {
    services: ServiceListItem[];
}

export default function KanbanPage({ services }: KanbanPageProps) {
    return (
        <>
            <Head title="Papan Teknisi" />
            
            <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 p-4 md:p-6 overflow-hidden">
                <div className="shrink-0 flex items-center justify-between">
                    <Heading 
                        title="Papan Teknisi (Kanban)" 
                        description="Geser kartu untuk memindahkan status. Klik kartu untuk mengisi form tindakan." 
                    />
                </div>

                <KanbanBoard services={services} />
            </div>
        </>
    );
}

KanbanPage.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Papan Teknisi', href: '/papan-teknisi' }]}>
        {page}
    </AppLayout>
);