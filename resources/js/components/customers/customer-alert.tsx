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
import type { Customer } from '@/types/customer';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'delete' | null;
    customer: Customer | null;
}

export function CustomerAlert({ open, onOpenChange, type, customer }: Props) {
    if (!customer) return null;

    const handleConfirm = () => {
        if (type === 'delete') {
            router.delete(`/customers/${customer.id}`, {
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
                        {type === 'delete' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                        Hapus Pelanggan?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus pelanggan "{customer.name}"? Data riwayat servis (Service Orders) mereka tidak akan terhapus, namun data profil pelanggan ini akan masuk ke Tempat Sampah.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                    >
                        Ya, Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
