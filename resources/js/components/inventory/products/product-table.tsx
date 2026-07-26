import { Pencil, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { PaginatedData } from '@/types/global';
import type { Product } from '@/types/product';
import { ProductAlert } from './product-alert';
import { ProductForm } from './product-form';

export function ProductTable({ products }: { products: PaginatedData<Product> }) {
    const [showPurchasePrice, setShowPurchasePrice] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [alertConfig, setAlertConfig] = useState<{ open: boolean; type: 'delete' | null; product: Product | null }>({ 
        open: false, type: null, product: null 
    });

    const triggerAlert = (type: typeof alertConfig.type, product: Product) => {
        setAlertConfig({ open: true, type, product });
    };

    const formatRupiah = (angka: string) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(angka));

    return (
        <>
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[80px] text-center">Foto</TableHead>
                        <TableHead>Produk & Spesifikasi</TableHead>
                        <TableHead>
                            <div className="flex items-center gap-2">
                                HPP (Modal)
                                <button onClick={() => setShowPurchasePrice(!showPurchasePrice)} className="text-muted-foreground hover:text-foreground">
                                    {showPurchasePrice ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </TableHead>
                        <TableHead>Harga Jual</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Belum ada produk di katalog.</TableCell>
                        </TableRow>
                    ) : (
                        products.data.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <div className="h-16 w-16 rounded-md border overflow-hidden bg-muted flex items-center justify-center">
                                        {p.image_path ? (
                                            <img src={`/storage/${p.image_path}`} alt={p.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-semibold text-foreground">{p.name}</div>
                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                        {p.brand} • {p.ram} • {p.storage} • {p.processor}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={`font-mono text-sm ${showPurchasePrice ? 'text-foreground' : 'text-muted-foreground select-none blur-[4px]'}`}>
                                        {formatRupiah(p.purchase_price)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                        {formatRupiah(p.selling_price)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={p.status === 'ready' ? 'outline' : 'secondary'} 
                                        className={p.status === 'ready' ? 'border-green-600 text-green-600 bg-green-50' : 
                                                  p.status === 'booked' ? 'border-amber-600 text-amber-600 bg-amber-50' : 'bg-slate-200 text-slate-600'}>
                                        {p.status === 'ready' ? 'Tersedia' : p.status === 'booked' ? 'Di-Booking' : 'Terjual'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => setEditProduct(p)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">Edit Produk</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => triggerAlert('delete', p)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">Hapus Produk</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <div className="border-t border-border">
                <Pagination links={products.links} from={products.from} to={products.to} total={products.total} />
            </div>

            <Dialog open={!!editProduct} onOpenChange={(val) => !val && setEditProduct(null)}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Edit Data Laptop Bekas</DialogTitle></DialogHeader>
                    {editProduct && <ProductForm product={editProduct} onSuccess={() => setEditProduct(null)} />}
                </DialogContent>
            </Dialog>

            <ProductAlert open={alertConfig.open} onOpenChange={(val) => setAlertConfig((prev) => ({ ...prev, open: val }))} type={alertConfig.type} product={alertConfig.product} />
        </>
    );
}
