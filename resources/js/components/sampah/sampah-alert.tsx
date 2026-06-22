import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
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
import type { TrashItem } from '@/types/sampah';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    action: 'restore' | 'force_delete' | null;
    item: TrashItem | null;
}

export function TrashAlert({ open, onOpenChange, action, item }: Props) {
    if (!item) return null;

    const handleConfirm = () => {
        if (action === 'restore') {
            router.post(
                `/sampah/${item.type}/${item.id}/restore`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => onOpenChange(false),
                },
            );
        } else if (action === 'force_delete') {
            router.delete(`/sampah/${item.type}/${item.id}/force-delete`, {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        {action === 'force_delete' && (
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        )}
                        {action === 'restore'
                            ? 'Pulihkan Data?'
                            : 'Hapus Permanen?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {action === 'restore'
                            ? `Apakah Anda yakin ingin memulihkan data ${item.category_label} "${item.data_info}"? Data ini akan kembali muncul di tabel utama operasional.`
                            : `Perhatian! Menghapus data ${item.category_label} "${item.data_info}" secara permanen tidak dapat dibatalkan. Data akan hilang selamanya dari database.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={
                            action === 'force_delete'
                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                : ''
                        }
                    >
                        {action === 'restore'
                            ? 'Ya, Pulihkan'
                            : 'Ya, Hapus Permanen'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
