import {
    Pencil,
    Trash2,
    ShieldAlert,
    ShieldCheck,
    KeyRound,
} from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PaginatedPegawai, Pegawai } from '@/types/pegawai';
import { PegawaiAlert } from './pegawai-alert';
import { PegawaiForm } from './pegawai-form';

export function PegawaiTable({ pegawais }: { pegawais: PaginatedPegawai }) {
    const [editPegawai, setEditPegawai] = useState<Pegawai | null>(null);
    const [alertConfig, setAlertConfig] = useState<{
        open: boolean;
        type: 'delete' | 'toggle_status' | 'reset_password' | null;
        pegawai: Pegawai | null;
    }>({ open: false, type: null, pegawai: null });

    const triggerAlert = (type: typeof alertConfig.type, pegawai: Pegawai) => {
        setAlertConfig({ open: true, type, pegawai });
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px] text-center">
                            No
                        </TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>No. Telepon</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pegawais.data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="py-8 text-center text-muted-foreground"
                            >
                                Tidak ada data pegawai yang ditemukan.
                            </TableCell>
                        </TableRow>
                    ) : (
                        pegawais.data.map((p, index) => (
                            <TableRow key={p.id}>
                                <TableCell className="text-center">
                                    {(pegawais.current_page - 1) *
                                        pegawais.per_page +
                                        index +
                                        1}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {p.name}
                                </TableCell>
                                <TableCell>{p.email}</TableCell>
                                <TableCell>{p.phone_number || '-'}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            p.role === 'administrator'
                                                ? 'destructive'
                                                : p.role === 'teknisi'
                                                  ? 'default'
                                                  : 'secondary'
                                        }
                                        className="capitalize shadow-none"
                                    >
                                        {p.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            p.is_active
                                                ? 'outline'
                                                : 'secondary'
                                        }
                                        className={`shadow-none ${p.is_active ? 'border-green-600 bg-green-50 text-green-700' : ''}`}
                                    >
                                        {p.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-500"
                                                    onClick={() =>
                                                        triggerAlert(
                                                            'reset_password',
                                                            p,
                                                        )
                                                    }
                                                >
                                                    <KeyRound className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">
                                                Reset Password
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-blue-600"
                                                    onClick={() =>
                                                        setEditPegawai(p)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">
                                                Edit Data
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className={`h-8 w-8 ${p.is_active ? 'text-amber-600' : 'text-emerald-600'}`}
                                                    onClick={() =>
                                                        triggerAlert(
                                                            'toggle_status',
                                                            p,
                                                        )
                                                    }
                                                >
                                                    {p.is_active ? (
                                                        <ShieldAlert className="h-4 w-4" />
                                                    ) : (
                                                        <ShieldCheck className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">
                                                {p.is_active
                                                    ? 'Nonaktifkan Akun'
                                                    : 'Aktifkan Akun'}
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() =>
                                                        triggerAlert(
                                                            'delete',
                                                            p,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">
                                                Hapus Akun
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Pagination 
                links={pegawais.links} 
                from={pegawais.from} 
                to={pegawais.to} 
                total={pegawais.total} 
            />

            <Dialog
                open={!!editPegawai}
                onOpenChange={(val) => !val && setEditPegawai(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Registrasi Pegawai</DialogTitle>
                    </DialogHeader>
                    {editPegawai && (
                        <PegawaiForm
                            pegawai={editPegawai}
                            onSuccess={() => setEditPegawai(null)}
                            // Anda dapat meneruskan prop 'roles' di sini jika tersedia,
                            // jika tidak, ambil lewat usePage() seperti di form
                        />
                    )}
                </DialogContent>
            </Dialog>

            <PegawaiAlert
                open={alertConfig.open}
                onOpenChange={(val) =>
                    setAlertConfig((prev) => ({ ...prev, open: val }))
                }
                type={alertConfig.type}
                pegawai={alertConfig.pegawai}
            />
        </>
    );
}
