import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Product } from '@/types/product';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'delete' | null;
    product: Product | null;
}

export function ProductAlert({ open, onOpenChange, type, product }: Props) {
    if (!product) return null;

    const handleConfirm = () => {
        if (type === 'delete') {
            if (product.status !== 'ready') {
                toast.error('Gagal: Produk yang sedang dibooking atau terjual tidak boleh dihapus.');
                onOpenChange(false);
                return;
            }
            router.delete(`/inventory/products/${product.id}`, {
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Data Laptop</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus <b>"{product.name}"</b>? Semua data spesifikasi dan fotonya akan dihapus permanen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Ya, Hapus Laptop
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}