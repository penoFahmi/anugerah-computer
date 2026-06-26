import { Head, router, usePoll } from '@inertiajs/react';
import { RefreshCcw } from 'lucide-react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { WaQrCard } from '@/components/wa/wa-qr-card';
import { WaStatusCard } from '@/components/wa/wa-status-card';
import AppLayout from '@/layouts/app-layout';

export default function ConfigWa({ waStatus }: { waStatus: any }) {

    usePoll(3000, {
        only: ['waStatus'],
        keepAlive: true,
    });

    return (
        <>
            <Head title="WhatsApp Gateway" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading 
                        title="WhatsApp Gateway" 
                        description="Status koneksi server Node.js Baileys." 
                    />
                    <Button variant="outline" onClick={() => router.reload({ only: ['waStatus'] })}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <WaStatusCard waStatus={waStatus} />
                    <WaQrCard waStatus={waStatus} />
                </div>
            </div>
        </>
    );
}

ConfigWa.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'WA Gateway', href: '/config/wa' }]}>
        {page}
    </AppLayout>
);