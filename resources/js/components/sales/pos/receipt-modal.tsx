import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Printer } from 'lucide-react';

interface ReceiptItem {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface InvoiceData {
    invoice_number: string;
    total_amount: number;
    discount: number;
    final_amount: number;
    paid_amount: number;
    change: number;
    items: ReceiptItem[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    invoice: InvoiceData | null;
}

export function ReceiptModal({ isOpen, onClose, invoice }: Props) {
    if (!invoice) return null;

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] print-content">
                <DialogHeader className="text-center sm:text-center print-hide">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Pembayaran Berhasil</DialogTitle>
                    <DialogDescription>
                        Transaksi telah tersimpan ke dalam sistem.
                    </DialogDescription>
                </DialogHeader>

                {/* Struk Area */}
                <div className="mt-4 p-4 border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm font-mono">
                    <div className="text-center font-bold mb-4 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                        <div className="text-base uppercase tracking-wider">Anugerah Computer</div>
                        <div className="text-xs font-normal text-muted-foreground mt-1">Struk Pembelian Kasir</div>
                        <div className="text-xs font-normal text-muted-foreground">{invoice.invoice_number}</div>
                    </div>

                    <div className="space-y-3 mb-4">
                        {invoice.items.map((item, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="flex-1 pr-4">
                                    <div className="line-clamp-2">{item.name}</div>
                                    <div className="text-muted-foreground text-xs">{item.quantity} x {formatRupiah(item.price)}</div>
                                </div>
                                <div className="font-semibold">{formatRupiah(item.subtotal)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-1 border-t border-dashed border-slate-300 dark:border-slate-700 pt-4 pb-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatRupiah(invoice.total_amount)}</span>
                        </div>
                        {invoice.discount > 0 && (
                            <div className="flex justify-between text-red-500">
                                <span>Diskon</span>
                                <span>-{formatRupiah(invoice.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <span>TOTAL</span>
                            <span>{formatRupiah(invoice.final_amount)}</span>
                        </div>
                    </div>

                    <div className="space-y-1 pt-2">
                        <div className="flex justify-between">
                            <span>Tunai</span>
                            <span>{formatRupiah(invoice.paid_amount)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                            <span>Kembali</span>
                            <span>{formatRupiah(invoice.change)}</span>
                        </div>
                    </div>

                    <div className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700">
                        Terima Kasih Atas Kunjungan Anda!
                    </div>
                </div>

                <DialogFooter className="sm:justify-between mt-6 print-hide">
                    <Button variant="outline" onClick={onClose}>
                        Tutup (ESC)
                    </Button>
                    <Button onClick={handlePrint} className="gap-2">
                        <Printer className="h-4 w-4" /> Cetak Struk
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
