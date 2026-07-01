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
import { destroy, toggleStatus } from '@/routes/pegawai';
import type { Pegawai } from '@/types/pegawai';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'delete' | 'toggle_status' | 'reset_password' | null;
    pegawai: Pegawai | null;
}

export function PegawaiAlert({ open, onOpenChange, type, pegawai }: Props) {
    if (!pegawai) {
return null;
}

    const handleConfirm = () => {
        if (type === 'delete') {
            router.delete(destroy.url(pegawai.id), {
                onSuccess: () => onOpenChange(false),
            });
        } else if (type === 'toggle_status') {
            router.patch(
                toggleStatus.url(pegawai.id),
                {},
                { onSuccess: () => onOpenChange(false) },
            );
        } else if (type === 'reset_password') {
            router.patch(
                `/pegawai/${pegawai.id}/reset-password`,
                {},
                { onSuccess: () => onOpenChange(false) },
            );
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {type === 'delete'
                            ? 'Hapus Pegawai'
                            : type === 'reset_password'
                              ? 'Reset Password Pegawai'
                              : 'Ubah Status Pegawai'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {type === 'delete'
                            ? `Apakah Anda yakin ingin menghapus "${pegawai.name}", akunnya. dapat dipulihkan di sampah?`
                            : type === 'reset_password'
                              ? `Apakah Anda yakin ingin mereset password "${pegawai.name}"?`
                              : `Apakah Anda yakin ingin mengubah status akun "${pegawai.name}"?`}
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
