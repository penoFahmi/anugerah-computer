import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { ServiceAlert } from '@/components/services/service-alert';
import { ServiceChatModal } from '@/components/services/service-chat-modal';
import { ServiceFormModal } from '@/components/services/service-form-modal';
import { ServiceProcessModal } from '@/components/services/service-process-modal';
import { ServiceTable } from '@/components/services/service-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { ServiceIndexProps, ServiceListItem } from '@/types/service';
import { ServiceFilters } from '@/components/services/service-filters';

export default function ServicesIndex({ serviceOrders, filters }: ServiceIndexProps) {
    const { flash } = usePage<ServiceIndexProps>().props;

    // State Manajemen Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedServiceToProcess, setSelectedServiceToProcess] = useState<ServiceListItem | null>(null);
    const [selectedServiceToChat, setSelectedServiceToChat] = useState<ServiceListItem | null>(null);
    const [selectedServiceToDelete, setSelectedServiceToDelete] = useState<ServiceListItem | null>(null);

    // Sentralisasi Flash Message
    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

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
                        serviceOrders={serviceOrders}
                        onProcessClick={setSelectedServiceToProcess}
                        onChatClick={setSelectedServiceToChat}
                        onDeleteClick={setSelectedServiceToDelete}
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
            <ServiceChatModal
                isOpen={!!selectedServiceToChat}
                onClose={() => setSelectedServiceToChat(null)}
                service={selectedServiceToChat}
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