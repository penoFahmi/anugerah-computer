import { router } from '@inertiajs/react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { SparePart } from '@/types/inventory';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: SparePart | null;
}

export function SparepartAlert({ open, onOpenChange, item }: Props) {
    if (!item) return null;

    const handleConfirm = () => {
        router.delete(`/inventory/spareparts/${item.id}`, {
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Barang dari Katalog?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus barang <b>"{item.name}"</b>? 
                        Data riwayat servis yang menggunakan barang ini tidak akan rusak, tetapi barang ini akan hilang dari pilihan kasir dan teknisi.
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