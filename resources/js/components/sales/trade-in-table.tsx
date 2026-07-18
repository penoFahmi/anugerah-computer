import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PackageOpen } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { PaginatedData } from '@/types/global';
import type { TradeIn } from '@/types/sales';

interface TradeInTableProps {
    tradeIns: PaginatedData<TradeIn>;
}

export function TradeInTable({ tradeIns }: TradeInTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (tradeIns.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <PackageOpen className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Belum Ada Data</h3>
                <p className="text-sm">Belum ada transaksi pembelian barang bekas yang dicatat.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>No. Pembelian</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Barang / Spesifikasi</TableHead>
                    <TableHead>Harga Beli</TableHead>
                    <TableHead>Tanggal</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tradeIns.data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.purchase_number}</TableCell>
                        <TableCell>{item.customer?.name || 'Umum'}</TableCell>
                        <TableCell>
                            <div className="font-medium">{item.item_name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{item.specification_summary}</div>
                        </TableCell>
                        <TableCell className="text-red-500 font-semibold">{formatCurrency(item.purchase_price)}</TableCell>
                        <TableCell>{format(new Date(item.created_at), 'dd MMM yyyy', { locale: id })}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
