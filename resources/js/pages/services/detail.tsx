import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Settings, MessageSquare, ListTodo } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ServiceDetailForm } from '@/components/services/service-detail-form';
import { ServiceDetailChat } from '@/components/services/service-detail-chat';

export default function ServicesDetail({ serviceOrder, recentServices }: { serviceOrder: any, recentServices: any[] }) {
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

            <div className="flex flex-col gap-6 p-4">
                
                {/* HEADER */}
                <div className="flex items-center gap-4">
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

                {/* 3-COLUMN LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    
                    {/* KOLOM KIRI (25%): DAFTAR SERVISAN AKTIF */}
                    <div className="lg:col-span-1 flex flex-col h-[700px] border border-border rounded-xl overflow-hidden bg-background shadow-sm">
                        <div className="bg-slate-800 p-4 text-white flex items-center gap-2 shrink-0">
                            <ListTodo className="h-4 w-4" />
                            <div>
                                <h3 className="font-bold text-sm">Servisan Aktif</h3>
                                <p className="text-[11px] text-slate-300">Pindah nota dengan cepat</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/20">
                            {recentServices && recentServices.length === 0 ? (
                                <div className="text-center text-xs text-muted-foreground mt-10">Tidak ada servisan lain.</div>
                            ) : (
                                recentServices?.map(rs => (
                                    <Link 
                                        key={rs.id} 
                                        href={`/services/${rs.id}`} 
                                        className={`block border p-3 rounded-lg transition-all group ${rs.id === serviceOrder.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card hover:border-primary/50'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className="font-bold text-primary text-sm group-hover:underline">{rs.order_number}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-foreground">{rs.customer_name}</div>
                                        <div className="text-xs text-muted-foreground truncate mt-0.5">{rs.device_name}</div>
                                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 mt-2 whitespace-nowrap">{rs.status_label}</Badge>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* KOLOM TENGAH (50%): FORM EDIT LENGKAP */}
                    <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6 h-[700px] overflow-y-auto">
                        <div className="flex items-center gap-2 border-b pb-4 mb-6">
                            <Settings className="h-5 w-5 text-primary" />
                            <div>
                                <h2 className="font-bold text-lg">Edit Data Keseluruhan</h2>
                                <p className="text-xs text-muted-foreground">Koreksi identitas pelanggan dan operasional.</p>
                            </div>
                        </div>
                        <ServiceDetailForm service={serviceOrder} />
                    </div>

                    {/* KOLOM KANAN (25%): CHAT DULU, BARU PDF */}
                    <div className="lg:col-span-1 flex flex-col h-[700px]">
                        <Tabs defaultValue="chat" className="w-full flex flex-col h-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
                                <TabsTrigger value="chat" className="gap-2"><MessageSquare className="h-4 w-4" /> Live Chat</TabsTrigger>
                                <TabsTrigger value="pdf" className="gap-2"><FileText className="h-4 w-4" /> Nota PDF</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="chat" className="mt-0 flex-1 overflow-hidden h-full">
                                <ServiceDetailChat service={serviceOrder} />
                            </TabsContent>

                            <TabsContent value="pdf" className="mt-0 flex-1 overflow-hidden h-full">
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