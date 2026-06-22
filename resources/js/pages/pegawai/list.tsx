import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search, FilterX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import Heading from '@/components/heading';
import { PegawaiForm } from '@/components/pegawai/pegawai-form';
import { PegawaiTable } from '@/components/pegawai/pegawai-table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/pegawai';
import type { PegawaiPageProps } from '@/types/pegawai';

export default function PegawaiList({ pegawais, roles, filters }: any) {
    const [open, setOpen] = useState(false);
    const { flash } = usePage<PegawaiPageProps>().props;

    // State Filter Kolektif ditambahkan per_page
    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        status: filters.status ?? 'all',
        role: filters.role ?? 'all',
        per_page: filters.per_page ?? '5',
    });

    useEffect(() => {
        if (flash?.toast) {
            if (flash.toast.type === 'success')
                toast.success(flash.toast.message);
            if (flash.toast.type === 'error') toast.error(flash.toast.message);
            if (flash.toast.type === 'warning')
                toast.warning(flash.toast.message);
        }
    }, [flash]);

    const handleSearchDebounce = useDebouncedCallback((value: string) => {
        applyFilters({ ...filterState, search: value });
    }, 400);

    const applyFilters = (newFilters: typeof filterState) => {
        const query: Record<string, string> = {};
        if (newFilters.search) query.search = newFilters.search;
        if (newFilters.status !== 'all') query.status = newFilters.status;
        if (newFilters.role !== 'all') query.role = newFilters.role;
        if (newFilters.per_page !== '5') query.per_page = newFilters.per_page;

        router.get(index.url(), query, { preserveState: true, replace: true });
    };

    const handleFilterChange = (
        key: keyof typeof filterState,
        value: string,
    ) => {
        const newFilters = { ...filterState, [key]: value };
        setFilterState(newFilters);
        applyFilters(newFilters);
    };

    const resetFilters = () => {
        const defaultFilters = {
            search: '',
            status: 'all',
            role: 'all',
            per_page: '5',
        };
        setFilterState(defaultFilters);
        router.get(index.url(), {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Manajemen Pegawai" />
            <div className="flex flex-col space-y-6 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Pegawai"
                        description="Kelola hak akses dan informasi akun pegawai Anugerah Computer"
                    />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Pegawai
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Registrasi Pegawai Baru
                                </DialogTitle>
                            </DialogHeader>
                            <PegawaiForm
                                key={String(open)}
                                onSuccess={() => setOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari pegawai..."
                            className="pl-8"
                            value={filterState.search}
                            onChange={(e) => {
                                setFilterState((prev) => ({
                                    ...prev,
                                    search: e.target.value,
                                }));
                                handleSearchDebounce(e.target.value);
                            }}
                        />
                    </div>
                    <Select
                        value={filterState.per_page}
                        onValueChange={(val) =>
                            handleFilterChange('per_page', val)
                        }
                    >
                        <SelectTrigger className="w-full sm:w-[120px]">
                            <SelectValue placeholder="Baris" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 Baris</SelectItem>
                            <SelectItem value="10">10 Baris</SelectItem>
                            <SelectItem value="20">20 Baris</SelectItem>
                            <SelectItem value="all">Semua</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filterState.status}
                        onValueChange={(val) =>
                            handleFilterChange('status', val)
                        }
                    >
                        <SelectTrigger className="w-full sm:w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filterState.role}
                        onValueChange={(val) => handleFilterChange('role', val)}
                    >
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Role</SelectItem>
                            {roles.map((r: any) => (
                                <SelectItem
                                    key={r.id}
                                    value={r.name}
                                    className="capitalize"
                                >
                                    {r.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {(filterState.search ||
                        filterState.status !== 'all' ||
                        filterState.role !== 'all' ||
                        filterState.per_page !== '5') && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetFilters}
                            title="Reset Filter"
                        >
                            <FilterX className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <PegawaiTable pegawais={pegawais} />
                </div>
            </div>
        </>
    );
}

PegawaiList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pegawai', href: index.url() }]}>
        {page}
    </AppLayout>
);
