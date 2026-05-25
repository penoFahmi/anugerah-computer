import { Head, router } from '@inertiajs/react';
import { Plus, Search, MoreHorizontal, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Heading from '@/components/heading';
import { ServiceForm } from '@/components/service/service-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/services';
import type { ServiceOrder, ServicePagination } from '@/types';

export default function ServiceList({
    services,
    filters,
}: {
    services: ServicePagination;
    filters: any;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [editingService, setEditingService] = useState<ServiceOrder | null>(
        null,
    );

    const handleSearch = useDebouncedCallback((value: string) => {
        router.get(
            index.url(),
            { search: value || undefined },
            { preserveState: true, replace: true },
        );
    }, 400);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'waiting_checking':
                return <Badge variant="secondary">Antrean Cek</Badge>;
            case 'waiting_approval':
                return (
                    <Badge variant="outline" className="text-amber-600">
                        Menunggu WA
                    </Badge>
                );
            case 'approved':
                return <Badge className="bg-blue-500">Disetujui</Badge>;
            case 'in_progress':
                return <Badge className="bg-purple-500">Dikerjakan</Badge>;
            case 'completed':
                return <Badge className="bg-emerald-500">Selesai</Badge>;
            case 'taken':
                return <Badge variant="outline">Diambil</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Batal</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Antrean Servis" />
            <div className="flex flex-col space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Antrean Servis"
                        description="Kelola penerimaan dan perbaikan unit pelanggan"
                    />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Terima Unit
                                Baru
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>
                                    Penerimaan Unit Servis
                                </DialogTitle>
                            </DialogHeader>
                            <ServiceForm
                                key={String(open)}
                                onSuccess={() => setOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari No Tiket, Nama, atau No WA..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            handleSearch(e.target.value);
                        }}
                    />
                </div>

                <div className="rounded-xl border bg-card p-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tiket</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Keluhan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.data.map((srv) => (
                                <TableRow key={srv.id}>
                                    <TableCell className="font-mono text-sm">
                                        {srv.order_number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">
                                            {srv.customer?.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {srv.customer?.phone}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>{srv.device?.brand}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {srv.device?.model}
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        className="max-w-[200px] truncate"
                                        title={srv.complaint}
                                    >
                                        {srv.complaint}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(srv.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setEditingService(srv)
                                                    }
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />{' '}
                                                    Edit / Update
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {services.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        Belum ada antrean servis.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
                    <span>Total {services.total} tiket</span>
                    <div className="flex gap-1">
                        {services.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() =>
                                    router.visit(link.url!, {
                                        preserveScroll: true,
                                    })
                                }
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Dialog
                open={!!editingService}
                onOpenChange={() => setEditingService(null)}
            >
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Data Servis</DialogTitle>
                    </DialogHeader>
                    {editingService && (
                        <ServiceForm
                            service={editingService}
                            onSuccess={() => setEditingService(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

ServiceList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Antrean Servis', href: index.url() }]}>
        {page}
    </AppLayout>
);
