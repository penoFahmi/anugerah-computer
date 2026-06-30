import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Settings, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ServiceDetailForm } from '@/components/services/service-detail-form';
import { ServiceDetailChat } from '@/components/services/service-detail-chat';

export default function ServicesDetail({ serviceOrder }: { serviceOrder: any }) {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    const pdfUrl = `/storage/documents/receipts/nota-${serviceOrder.order_number}.pdf`;

    return (
        <>
            <Head title={`Detail ${serviceOrder.order_number}`} />

            {/* Container */}
            <div className="flex flex-col gap-4 p-4 h-[calc(100vh-4rem)] overflow-hidden">
                
                {/* HEADER */}
                <div className="flex items-center gap-4 shrink-0">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/services"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <Heading title={`Nota: ${serviceOrder.order_number}`} description="Pusat Kendali Data Servisan" />
                            <Badge variant="outline" className="ml-2 uppercase tracking-wider bg-background">{serviceOrder.status}</Badge>
                        </div>
                    </div>
                </div>

                {/* 2-COLUMN LAYOUT (Lebih luas dan lega) */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden mt-2">
                    
                    {/* KOLOM KIRI (65%): FORM EDIT LENGKAP */}
                    <div className="lg:col-span-2 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full">
                        <div className="flex items-center gap-2 border-b p-4 shrink-0 bg-muted/20">
                            <Settings className="h-5 w-5 text-primary" />
                            <div>
                                <h2 className="font-bold text-sm">Edit Data Keseluruhan</h2>
                                <p className="text-[10px] text-muted-foreground">Koreksi identitas pelanggan dan operasional.</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">
                            <ServiceDetailForm service={serviceOrder} />
                        </div>
                    </div>

                    {/* KOLOM KANAN (35%): CHAT & PDF */}
                    <div className="lg:col-span-1 flex flex-col h-full">
                        <Tabs defaultValue="chat" className="w-full flex flex-col h-full">
                            <TabsList className="grid w-full grid-cols-2 mb-3 shrink-0 h-10">
                                <TabsTrigger value="chat" className="gap-2 text-xs"><MessageSquare className="h-3.5 w-3.5" /> Live Chat WA</TabsTrigger>
                                <TabsTrigger value="pdf" className="gap-2 text-xs"><FileText className="h-3.5 w-3.5" /> Nota PDF</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="chat" className="mt-0 flex-1 overflow-hidden">
                                <ServiceDetailChat service={serviceOrder} />
                            </TabsContent>

                            <TabsContent value="pdf" className="mt-0 flex-1 overflow-hidden">
                                <div className="border border-border rounded-xl overflow-hidden shadow-sm h-full bg-muted">
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
    <AppLayout breadcrumbs={[{ title: 'Servis', href: '/services' }, { title: 'Detail', href: '#' }]}>
        {page}
    </AppLayout>
);