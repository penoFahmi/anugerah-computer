import { router,Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { KanbanBoard } from '@/components/services/kanban-board';
import AppLayout from '@/layouts/app-layout';

import type { GlobalPageProps } from '@/types/global';
import type { ServiceListItem } from '@/types/service';
import { useEcho } from '@laravel/echo-react';

// Extend GlobalPageProps agar bisa membaca flash.toast dari server
interface KanbanPageProps extends GlobalPageProps {
    services: ServiceListItem[];
    available_spare_parts: any[];
}

export default function KanbanPage({ services, available_spare_parts }: KanbanPageProps) {
    const { flash } = usePage<KanbanPageProps>().props;


    const { auth } = usePage<any>().props;

    useEcho('admin.notifications', '.service.crud', (e: any) => {
        
        
        console.log(`Ada perubahan data via WebSocket: Aksi ${e.action} pada nota ${e.serviceOrder?.order_number}`);

        if (e.action === 'updated' && e.serviceOrder) {
            const status = e.serviceOrder.status;
            const nota = e.serviceOrder.order_number;
            
            if (status === 'approved') {
                toast.success(`🎉 HORE! Pelanggan (Nota: ${nota}) baru saja MENYETUJUI biaya servis!`, { duration: 6000 });
            } else if (status === 'cancelled') {
                toast.error(`❌ Pelanggan (Nota: ${nota}) MEMBATALKAN servis.`, { duration: 6000 });
            }
        }
        
        router.reload({ 
            preserveScroll: true, 
            preserveState: true 
        });
    });

    // Sentralisasi Flash Message
    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    return (
        <>
            <Head title="Papan Teknisi" />
            
            {/* Mengunci tinggi agar Kanban Board bisa di-scroll secara independen (Horizontal/Vertical) */}
            <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 overflow-hidden p-4 md:p-6">
                <div className="shrink-0 flex items-center justify-between">
                    <Heading 
                        title="Papan Teknisi (Kanban)" 
                        description="Geser kartu untuk memindahkan status. Klik kartu untuk melihat detail atau memproses operasional." 
                    />
                </div>

                {/* Render Papan Kanban */}
                <KanbanBoard services={services} available_spare_parts={available_spare_parts} />
            </div>
        </>
    );
}

KanbanPage.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Papan Teknisi', href: '/kanban' }]}>
        {page}
    </AppLayout>
);