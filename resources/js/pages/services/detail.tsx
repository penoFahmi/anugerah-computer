import { Head, usePage } from '@inertiajs/react';
import { FileText, Settings, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { ServiceDetailChat } from '@/components/services/service-detail-chat';
import { ServiceDetailForm } from '@/components/services/service-detail-form';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';

import type { GlobalPageProps } from '@/types/global';
import type { ServiceListItem } from '@/types/service';

interface ServiceDetailProps extends GlobalPageProps {
    serviceOrder: ServiceListItem & {
        customer: any;
        device: any;
    };
}

export default function ServicesDetail({ serviceOrder }: ServiceDetailProps) {
    const { flash } = usePage<ServiceDetailProps>().props;

    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    const pdfUrl = `/storage/documents/receipts/nota-${serviceOrder.order_number}.pdf`;

    return (
        <>
            <Head title={`Detail ${serviceOrder.order_number}`} />
            <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 overflow-hidden p-4">
                {/* HEADER (Terkunci di atas) */}
                <div className="flex shrink-0 items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Heading
                            title={`Nota: ${serviceOrder.order_number}`}
                            description="Pusat Kendali Data Servisan"
                        />
                        <Badge
                            variant="outline"
                            className="ml-2 bg-background tracking-wider text-foreground uppercase shadow-sm"
                        >
                            {serviceOrder.status_label || serviceOrder.status}
                        </Badge>
                    </div>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm xl:col-span-2">
                        {/* Header Kolom Form */}
                        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-muted/20 p-4">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Settings className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-foreground">
                                    Edit Data Keseluruhan
                                </h2>
                                <p className="text-[11px] text-muted-foreground">
                                    Koreksi identitas pelanggan dan detail
                                    operasional teknisi.
                                </p>
                            </div>
                        </div>

                        {/* Area Komponen Form: Memenuhi seluruh sisa ruang */}
                        <div className="min-h-0 flex-1 overflow-hidden">
                            <ServiceDetailForm service={serviceOrder} />
                        </div>
                    </div>

                    {/* KOLOM KANAN (TABS CHAT & PDF) */}
                    <div className="flex h-full flex-col overflow-hidden xl:col-span-1">
                        <Tabs
                            defaultValue="chat"
                            className="flex h-full w-full flex-col overflow-hidden"
                        >
                            <TabsList className="mb-3 grid h-10 w-full shrink-0 grid-cols-2 bg-muted">
                                <TabsTrigger
                                    value="chat"
                                    className="gap-2 text-xs font-semibold"
                                >
                                    <MessageSquare className="h-3.5 w-3.5" />{' '}
                                    Live Chat
                                </TabsTrigger>
                                <TabsTrigger
                                    value="pdf"
                                    className="gap-2 text-xs font-semibold"
                                >
                                    <FileText className="h-3.5 w-3.5" /> Nota
                                    PDF
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="chat"
                                className="m-0 min-h-0 flex-1 flex-col overflow-hidden data-[state=active]:flex"
                            >
                                <ServiceDetailChat service={serviceOrder} />
                            </TabsContent>

                            <TabsContent
                                value="pdf"
                                className="m-0 min-h-0 flex-1 flex-col overflow-hidden data-[state=active]:flex"
                            >
                                <div className="h-full overflow-hidden rounded-xl border border-border bg-muted/50 shadow-sm">
                                    <iframe
                                        src={pdfUrl}
                                        width="100%"
                                        height="100%"
                                        title="PDF Nota"
                                        className="border-none"
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
}

ServicesDetail.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Servis', href: '/services' },
            { title: 'Detail', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
