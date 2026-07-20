import { router, Head, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { ServiceAlert } from '@/components/services/service-alert';
import { ServiceFilters } from '@/components/services/service-filters';
import { ServiceFormModal } from '@/components/services/service-form-modal';
import { ServiceProcessModal } from '@/components/services/service-process-modal';
import { ServiceTable } from '@/components/services/service-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { ServiceIndexProps, ServiceListItem } from '@/types/service';

export default function ServicesIndex({ serviceOrders, filters }: ServiceIndexProps) {
    const { flash } = usePage<ServiceIndexProps>().props;

    // State Manajemen Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedServiceToProcess, setSelectedServiceToProcess] = useState<ServiceListItem | null>(null);
    const [selectedServiceToDelete, setSelectedServiceToDelete] = useState<ServiceListItem | null>(null);
    const [unreadPhones, setUnreadPhones] = useState<string[]>([]);

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
    })

    useEcho('admin.notifications', '.chat.new_message', (e: any) => {
        if (e.chatLog && e.chatLog.direction === 'inbound') {
            const phone = e.chatLog.phone;
            if (phone) {
                setUnreadPhones(prev => 
                    prev.includes(phone) ? prev : [...prev, phone]
                );
            }
        }
    });

    // Sentralisasi Flash Message
    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    const handleOpenChat = (service: ServiceListItem) => {
        const phone = service.customer_phone;
        window.dispatchEvent(new CustomEvent('open-global-chat', { detail: { phone } }));
        setUnreadPhones(prev => prev.filter(p => p !== phone));
    };

    return (
        <>
            <Head title="Pusat Servis" />

            <div className="flex flex-col space-y-6 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Pusat Servis"
                        description="Manajemen pekerjaan teknisi dan Live Chat WA pelanggan"
                    />
                    <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Terima Servisan
                    </Button>
                </div>

                {/* Komponen Filter (Mencakup Tabs Status dan Search) */}
                <ServiceFilters filters={filters} />

                {/* Tabel */}
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <ServiceTable
                        unreadChatPhones={unreadPhones}
                        serviceOrders={serviceOrders}
                        onProcessClick={setSelectedServiceToProcess}
                        onDeleteClick={setSelectedServiceToDelete}
                        onChatClick={handleOpenChat}
                    />
                </div>
            </div>

            {/* Kumpulan Modals */}
            <ServiceFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            <ServiceProcessModal
                isOpen={!!selectedServiceToProcess}
                onClose={() => setSelectedServiceToProcess(null)}
                service={selectedServiceToProcess}
            />
            <ServiceAlert
                open={!!selectedServiceToDelete}
                onOpenChange={(val) => !val && setSelectedServiceToDelete(null)}
                type="delete"
                service={selectedServiceToDelete}
            />
        </>
    );
}

ServicesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Servis', href: '/services' }]}>
        {page}
    </AppLayout>
);