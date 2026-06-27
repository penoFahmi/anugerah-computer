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
import type { ServiceListItem } from '@/types/service';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'delete' | null;
    service: ServiceListItem | null;
}

export function ServisAlert({ open, onOpenChange, type, service }: Props) {
    if (!service) return null;

    const handleConfirm = () => {
        if (type === 'delete') {
            router.delete(`/services/${service.id}`, {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Data Servisan</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus Nota "{service.order_number}" atas nama {service.customer_name}? Data yang dihapus akan dipindahkan ke tempat sampah.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Ya, Hapus Data
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}