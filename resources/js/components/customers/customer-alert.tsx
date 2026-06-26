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

import { destroy } from '@/routes/customers';
import type { Customer } from '@/types/customer';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'delete' | 'toggle_status' | 'reset_password' | null;
    customer: Customer | null;
}

export function CustomerAlert({ open, onOpenChange, type, customer }: Props) {
    if (!customer) {
return null;
}

    // Confirm password reset
    const handleConfirm = () => {
        if (type === 'delete') {
            router.delete(destroy.url(customer.id), {
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {type === 'delete'
                            ? 'Hapus Customer' : ''}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {type === 'delete' ? `Apakah Anda yakin ingin menghapus "${customer.name}" secara permanen?` : ''}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={
                            type === 'delete'
                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                : ''
                        }
                    >
                        Ya, Lanjutkan
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
