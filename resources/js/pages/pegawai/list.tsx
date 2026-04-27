import { Head, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { index } from '@/actions/App/Http/Controllers/PegawaiController';
import Heading from '@/components/heading';
import { PegawaiForm } from '@/components/pegawai/pegawai-form';
import { PegawaiTable } from '@/components/pegawai/pegawai-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

export default function PegawaiList({ pegawais, filters }: any) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = useDebouncedCallback((value: string) => {
        router.get(index.url(), { search: value || undefined }, { preserveState: true, replace: true });
    }, 400);

    return (
        <>
            <Head title="Pegawai" />
            <div className="flex flex-col space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Pegawai" description="Kelola hak akses dan informasi akun pegawai" />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Tambah Pegawai</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Registrasi Pegawai</DialogTitle>
                            </DialogHeader>
                            {/* Key {String(open)} memaksa component re-mount agar data bersih */}
                            <PegawaiForm key={String(open)} onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari..." 
                        className="pl-8" 
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); handleSearch(e.target.value); }}
                    />
                </div>

                <div className="rounded-xl border bg-card p-2">
                    <PegawaiTable pegawais={pegawais} />
                </div>
            </div>
        </>
    );
}

PegawaiList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pegawai', href: index.url() }]}>{page}</AppLayout>
);