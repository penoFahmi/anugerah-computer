import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { PaginatedData } from '@/types/global';
import type { CashflowTransaction } from '@/types/finance';

interface CashflowTableProps {
    transactions: PaginatedData<CashflowTransaction>;
}

export function CashflowTable({ transactions }: CashflowTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (transactions.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <Wallet className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Belum Ada Transaksi</h3>
                <p className="text-sm">Belum ada pergerakan arus kas yang dicatat.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap">
                            {format(new Date(item.transaction_date), 'dd MMM yyyy HH:mm', { locale: id })}
                        </TableCell>
                        <TableCell>
                            {item.type === 'income' ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                                    <ArrowUpRight className="w-3 h-3 mr-1" /> Masuk
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                    <ArrowDownRight className="w-3 h-3 mr-1" /> Keluar
                                </Badge>
                            )}
                        </TableCell>
                        <TableCell className="capitalize">{String(item.category).replace(/_/g, ' ').toLowerCase()}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={item.notes || ''}>{item.notes || '-'}</TableCell>
                        <TableCell className={`text-right font-semibold ${item.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
