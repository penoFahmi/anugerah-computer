import { router, usePage } from '@inertiajs/react';
import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react'; // MoreHorizontal dihapus
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { destroy, toggleStatus } from '@/routes/pegawai';
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
                        <TableHead>No. Telepon</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pegawais.data.map((pegawai) => (
                        <TableRow key={pegawai.id} className={!pegawai.is_active ? 'opacity-50' : ''}>
                            <TableCell className="font-medium">{pegawai.name}</TableCell>
                            <TableCell>{pegawai.email}</TableCell>
                            <TableCell>{pegawai.phone_number || '-'}</TableCell>
                            <TableCell>
                                <Badge variant={pegawai.is_active ? 'default' : 'secondary'}>
                                    {pegawai.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {/* Container Aksi Baru dengan Flexbox */}
                                <div className="flex items-center justify-end gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setEditingPegawai(pegawai)}
                                        title="Edit Pegawai"
                                    >
                                        <Pencil className="h-4 w-4 text-blue-500" />
                                    </Button>

                                    {auth.user.id !== pegawai.id && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => router.patch(toggleStatus.url(pegawai.id))}
                                            title={pegawai.is_active ? "Nonaktifkan Pegawai" : "Aktifkan Pegawai"}
                                        >
                                            {pegawai.is_active ? (
                                                <PowerOff className="h-4 w-4 text-amber-500" />
                                            ) : (
                                                <Power className="h-4 w-4 text-green-500" />
                                            )}
                                        </Button>
                                    )}

                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        disabled={auth.user.id === pegawai.id}
                                        onClick={() => confirm('Hapus pegawai?') && router.delete(destroy.url(pegawai.id))}
                                        title="Hapus Pegawai"
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
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