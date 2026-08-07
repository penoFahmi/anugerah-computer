import { Head, usePage } from '@inertiajs/react';
import { Plus, Search, FilterX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProcurementTable } from '@/components/inventory/procurement/procurement-table';
import { ProcurementForm } from '@/components/inventory/procurement/procurement-form';
import type { ProcurementPageProps } from '@/types/procurement';

export default function ProcurementList({ procurements, filters }: ProcurementPageProps) {
    const [open, setOpen] = useState(false);
    const { flash } = usePage<ProcurementPageProps>().props;

    useEffect(() => {
        if (flash?.toast) toast[flash.toast.type](flash.toast.message);
    }, [flash]);

    return (
        <>
            <Head title="Pengadaan Barang" />
            <div className="flex flex-col space-y-6 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading title="Pengadaan Barang" description="Riwayat pembelian stok sparepart ke supplier" />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Catat Belanja Stok</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader><DialogTitle>Form Pengadaan Stok</DialogTitle></DialogHeader>
                            <ProcurementForm onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
                
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <ProcurementTable procurements={procurements} />
                </div>
            </div>
        </>
    );
}

ProcurementList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Inventaris', href: '#' }, { title: 'Pengadaan', href: '/inventory/procurement' }]}>
        {page}
    </AppLayout>
);
