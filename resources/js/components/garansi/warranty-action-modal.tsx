import { useForm } from '@inertiajs/react';
import { Loader2, ShieldAlert, Ban, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { WarrantyListItem } from '@/types/warranty';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    warranty: WarrantyListItem | null;
    type: 'claim' | 'void' | null;
}

export function WarrantyActionModal({
    isOpen,
    onClose,
    warranty,
    type,
}: Props) {
    const formVoid = useForm({
        status: 'void',
        notes: '',
    });

    const formClaim = useForm({
        complaint: '',
    });

    useEffect(() => {
        if (isOpen && warranty) {
            if (type === 'void') {
                formVoid.reset();
                formVoid.clearErrors();
            } else if (type === 'claim') {
                formClaim.reset();
                formClaim.clearErrors();
                formClaim.setData(
                    'complaint',
                    `[KLAIM GARANSI #${warranty.claim_count + 1} DARI NOTA: ${warranty.order_number}] \n\nKeluhan saat ini: `,
                );
            }
        }
    }, [isOpen, type, warranty]);

    if (!warranty || !type) return null;

    const isClaim = type === 'claim';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isClaim) {
            if (!formVoid.data.notes.trim()) {
                toast.error(
                    'Gagal: Catatan alasan wajib diisi jika menghanguskan garansi.',
                );
                return;
            }

            formVoid.patch(`/garansi/${warranty.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    formVoid.reset();
                    onClose();
                },
            });
        } else {
            if (
                formClaim.data.complaint.trim() ===
                `[KLAIM GARANSI #${warranty.claim_count + 1} DARI NOTA: ${warranty.order_number}] \n\nKeluhan saat ini:`
            ) {
                toast.error(
                    'Gagal: Silakan tulis keluhan kerusakan yang baru.',
                );
                return;
            }

            formClaim.post(`/garansi/${warranty.id}/claim`, {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="overflow-hidden rounded-xl p-0 sm:max-w-[480px]">
                <div
                    className={`border-b p-4 ${isClaim ? 'border-blue-100 bg-blue-50/50' : 'border-red-100 bg-red-50/50'}`}
                >
                    <DialogTitle
                        className={`flex items-center gap-2 text-base font-bold ${isClaim ? 'text-blue-700' : 'text-red-700'}`}
                    >
                        {isClaim ? (
                            <ShieldAlert className="h-5 w-5" />
                        ) : (
                            <Ban className="h-5 w-5" />
                        )}
                        {isClaim
                            ? 'Proses Klaim Garansi'
                            : 'Hanguskan Garansi (Void)'}
                    </DialogTitle>
                    <DialogDescription className="mt-1.5 text-xs text-slate-600">
                        Kode:{' '}
                        <span className="font-bold">
                            {warranty.warranty_code}
                        </span>{' '}
                        | Unit: {warranty.device_name}
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-5">
                    {isClaim ? (
                        <>
                            <Alert className="border-blue-200 bg-blue-50">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="ml-2 text-[11px] text-blue-700">
                                    Sistem akan menerbitkan{' '}
                                    <b>Nota Servis Baru (Rp 0)</b> untuk
                                    pelanggan ini. Masa garansi utama tidak akan
                                    berubah. Ini adalah klaim ke-
                                    {warranty.claim_count + 1}.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">
                                    Keluhan Saat Ini
                                </Label>
                                <Textarea
                                    className="h-28 text-sm"
                                    value={formClaim.data.complaint}
                                    onChange={(e) =>
                                        formClaim.setData(
                                            'complaint',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                Alasan Dihanguskan{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                className="h-24 resize-none text-sm"
                                placeholder="Misal: Segel toko rusak atau kesalahan pengguna."
                                value={formVoid.data.notes}
                                onChange={(e) =>
                                    formVoid.setData('notes', e.target.value)
                                }
                                required
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2 border-t pt-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={
                                formVoid.processing || formClaim.processing
                            }
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant={isClaim ? 'default' : 'destructive'}
                            className={
                                isClaim ? 'bg-blue-600 hover:bg-blue-700' : ''
                            }
                            disabled={
                                formVoid.processing || formClaim.processing
                            }
                        >
                            {isClaim ? 'Terbitkan Nota Klaim' : 'Ya, Hanguskan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
