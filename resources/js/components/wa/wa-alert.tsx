import { router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';

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
import { logout } from '@/routes/config/wa';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'logout' | null;
}

export function WaAlert({ open, onOpenChange, type }: Props) {
    if (!type) return null;

    const handleConfirm = () => {
        if (type === 'logout') {
            // PERBAIKAN: Argument ke-2 adalah data payload ({}), argument ke-3 adalah options
            router.post(logout.url(), {}, {
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
                        {type === 'logout' && (
                            <LogOut className="h-5 w-5 text-destructive" />
                        )}
                        Putuskan Koneksi
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin memutuskan koneksi WhatsApp? Sistem akan otomatis membuat QR Code baru.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={
                            type === 'logout'
                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                : ''
                        }
                    >
                        Ya, Putuskan
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}