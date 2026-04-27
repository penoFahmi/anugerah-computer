import { Head } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { PegawaiForm } from '@/components/pegawai/pegawai-form';
import { PegawaiTable } from '@/components/pegawai/pegawai-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout'; // Tetap import untuk properti .layout

export default function List({ pegawais }: any) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Head title="Manajemen Pegawai" />
            
            {/* Pakai struktur div bawaan dashboard agar margin/padding sinkron */}
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Pegawai</h2>
                        <p className="text-sm text-muted-foreground">
                            Kelola personil elhalc8n.space di sini.
                        </p>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <UserPlus className="h-4 w-4" />
                                Tambah Pegawai
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Daftarkan Pegawai Baru</DialogTitle>
                            </DialogHeader>
                            <PegawaiForm onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-2 dark:border-sidebar-border">
                    <PegawaiTable data={pegawais.data} />
                </div>
            </div>
        </>
    );
}

List.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pegawai', href: '/pegawai' }]}>
        {page}
    </AppLayout>
);