import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { SparePart } from '@/types/sparepart';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'delete' | null;
    part: SparePart | null;
}

export function SparepartAlert({ open, onOpenChange, type, part }: Props) {
    if (!part) return null;

    const handleConfirm = () => {
        if (type === 'delete') {
            if (part.stock > 0) {
                toast.error('Gagal: Barang ini masih memiliki stok fisik di gudang. Habiskan stok terlebih dahulu.');
                onOpenChange(false);
                return;
            }
            router.delete(`/inventory/spareparts/${part.id}`, {
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Sparepart</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus <b>"{part.name}"</b> dari katalog? Data yang dihapus tidak dapat dikembalikan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Ya, Hapus Barang
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
