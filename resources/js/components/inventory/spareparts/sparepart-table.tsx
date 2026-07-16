import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { PaginatedData } from '@/types/global';
import type { SparePart } from '@/types/sparepart';
import { SparepartAlert } from './sparepart-alert';
import { SparepartForm } from './sparepart-form';

export function SparepartTable({ spareparts }: { spareparts: PaginatedData<SparePart> }) {
    const [showPurchasePrice, setShowPurchasePrice] = useState(false);
    const [editPart, setEditPart] = useState<SparePart | null>(null);
    const [alertConfig, setAlertConfig] = useState<{ open: boolean; type: 'delete' | null; part: SparePart | null }>({ 
        open: false, type: null, part: null 
    });

    const triggerAlert = (type: typeof alertConfig.type, part: SparePart) => {
        setAlertConfig({ open: true, type, part });
    };

    const formatRupiah = (angka: string) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(angka));

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px] text-center">No</TableHead>
                        <TableHead>Informasi Barang</TableHead>
                        <TableHead>
                            <div className="flex items-center gap-2">
                                Harga Modal
                                <button onClick={() => setShowPurchasePrice(!showPurchasePrice)} className="text-muted-foreground hover:text-foreground">
                                    {showPurchasePrice ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </TableHead>
                        <TableHead>Harga Jual</TableHead>
                        <TableHead className="text-center">Sisa Stok</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {spareparts.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                Belum ada barang di katalog.
                            </TableCell>
                        </TableRow>
                    ) : (
                        spareparts.data.map((part, index) => (
                            <TableRow key={part.id}>
                                <TableCell className="text-center">
                                    {(spareparts.current_page - 1) * spareparts.per_page + index + 1}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-foreground">{part.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-xs text-muted-foreground">{part.sku || 'Tanpa SKU'}</span>
                                        {part.is_always_indent && <Badge variant="outline" className="text-[10px] h-4 py-0 text-orange-600 border-orange-200 bg-orange-50">INDEN</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={`font-mono text-sm ${showPurchasePrice ? 'text-foreground' : 'text-muted-foreground select-none blur-[4px]'}`}>
                                        {formatRupiah(part.purchase_price)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                                        {formatRupiah(part.selling_price)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {part.stock > 3 ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100">{part.stock} Pcs</Badge>
                                    ) : part.stock > 0 ? (
                                        <Badge className="bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-100">{part.stock} Pcs</Badge>
                                    ) : (
                                        <Badge className="bg-red-100 text-red-700 border-red-300 hover:bg-red-100">Habis (0)</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => setEditPart(part)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">Edit Data</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => triggerAlert('delete', part)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">Hapus Barang</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Pagination links={spareparts.links} from={spareparts.from} to={spareparts.to} total={spareparts.total} />

            <Dialog open={!!editPart} onOpenChange={(val) => !val && setEditPart(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Data Sparepart</DialogTitle>
                    </DialogHeader>
                    {editPart && <SparepartForm part={editPart} onSuccess={() => setEditPart(null)} />}
                </DialogContent>
            </Dialog>

            <SparepartAlert open={alertConfig.open} onOpenChange={(val) => setAlertConfig((prev) => ({ ...prev, open: val }))} type={alertConfig.type} part={alertConfig.part} />
        </>
    );
}