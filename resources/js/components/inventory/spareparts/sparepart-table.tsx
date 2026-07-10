import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { PaginatedData } from '@/types/global';
import type { SparePart } from '@/types/inventory';
import { SparepartAlert } from './sparepart-alert';
import { SparepartForm } from './sparepart-form';

// Helper untuk format mata uang
const formatRupiah = (angka: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(angka));
};

export function SparepartTable({ spareparts }: { spareparts: PaginatedData<SparePart> }) {
    const [editItem, setEditItem] = useState<SparePart | null>(null);
    const [alertConfig, setAlertConfig] = useState<{ open: boolean; item: SparePart | null }>({ open: false, item: null });

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[50px] text-center">No</TableHead>
                        <TableHead>Kode / SKU</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead className="text-right">Harga Modal</TableHead>
                        <TableHead className="text-right">Harga Jual</TableHead>
                        <TableHead className="text-center">Stok</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {spareparts.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                Tidak ada data barang yang ditemukan.
                            </TableCell>
                        </TableRow>
                    ) : (
                        spareparts.data.map((p, index) => (
                            <TableRow key={p.id}>
                                <TableCell className="text-center">
                                    {(spareparts.current_page - 1) * spareparts.per_page + index + 1}
                                </TableCell>
                                <TableCell className="text-slate-500 font-mono text-xs">{p.sku}</TableCell>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{formatRupiah(p.purchase_price)}</TableCell>
                                <TableCell className="text-right font-semibold text-emerald-600">{formatRupiah(p.selling_price)}</TableCell>
                                <TableCell className="text-center">
                                    {p.is_always_indent ? (
                                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Pre-Order</Badge>
                                    ) : p.stock > 0 ? (
                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">{p.stock} Unit</Badge>
                                    ) : (
                                        <Badge variant="destructive">Habis</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => setEditItem(p)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">Edit Data</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setAlertConfig({ open: true, item: p })}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">Hapus Katalog</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Pagination links={spareparts.links} from={spareparts.from} to={spareparts.to} total={spareparts.total} />

            <Dialog open={!!editItem} onOpenChange={(val) => !val && setEditItem(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Barang</DialogTitle>
                    </DialogHeader>
                    {editItem && (
                        <SparepartForm item={editItem} onSuccess={() => setEditItem(null)} />
                    )}
                </DialogContent>
            </Dialog>

            <SparepartAlert
                open={alertConfig.open}
                onOpenChange={(val) => setAlertConfig((prev) => ({ ...prev, open: val }))}
                item={alertConfig.item}
            />
        </>
    );
}