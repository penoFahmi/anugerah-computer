import { router,Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
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
            
            {/* Penyesuaian tinggi agar scrollbar horizontal tidak menyebabkan vertical-scroll kecil pada layar */}
            <div className="flex h-[calc(100vh-6.5rem)] min-h-[500px] flex-col gap-4 overflow-hidden pt-4 px-4 md:pt-6 md:px-6 pb-0">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Kanban Operasional</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Visualisasi alur kerja teknisi. Pindahkan kartu untuk memperbarui status.</p>
                    </div>
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