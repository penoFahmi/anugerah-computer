import { router, usePage } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { destroy, toggleStatus } from '@/actions/App/Http/Controllers/PegawaiController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Pegawai, PegawaiPagination } from '@/types';
import { PegawaiForm } from './pegawai-form';

export function PegawaiTable({ pegawais }: { pegawais: PegawaiPagination }) {
    const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
    const auth = usePage().props.auth as any;

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pegawais.data.map((pegawai) => (
                        <TableRow key={pegawai.id} className={!pegawai.is_active ? 'opacity-50' : ''}>
                            <TableCell className="font-medium">{pegawai.name}</TableCell>
                            <TableCell>{pegawai.email}</TableCell>
                            <TableCell>
                                <Badge variant={pegawai.is_active ? 'default' : 'secondary'}>
                                    {pegawai.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingPegawai(pegawai)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        {auth.user.id !== pegawai.id && (
                                            <DropdownMenuItem onClick={() => router.patch(toggleStatus.url(pegawai.id))}>
                                                {pegawai.is_active ? <><PowerOff className="mr-2 h-4 w-4" /> Nonaktifkan</> : <><Power className="mr-2 h-4 w-4" /> Aktifkan</>}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem 
                                            disabled={auth.user.id === pegawai.id}
                                            onClick={() => confirm('Hapus pegawai?') && router.delete(destroy.url(pegawai.id))}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
                <span>Total {pegawais.total} pegawai</span>
                <div className="flex gap-1">
                    {pegawais.links.map((link, i) => (
                        <Button 
                            key={i} 
                            variant={link.active ? 'default' : 'outline'} 
                            size="sm" 
                            disabled={!link.url}
                            onClick={() => router.visit(link.url!, { preserveScroll: true })}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>

            {/* Modal Edit */}
            <Dialog open={!!editingPegawai} onOpenChange={() => setEditingPegawai(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Pegawai</DialogTitle></DialogHeader>
                    {editingPegawai && <PegawaiForm pegawai={editingPegawai} onSuccess={() => setEditingPegawai(null)} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}