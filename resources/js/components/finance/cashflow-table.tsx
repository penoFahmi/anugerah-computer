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

const getCategoryBadge = (category: string) => {
    switch (category) {
        case 'dp_servis':
            return {
                label: 'DP Servis',
                className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
            };
        case 'pelunasan_servis':
            return {
                label: 'Pelunasan Servis',
                className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
            };
        case 'pengembalian_dana':
            return {
                label: 'Refund Pelanggan',
                className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            };
        case 'biaya_pengecekan':
            return {
                label: 'Biaya Cek (Batal)',
                className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            };
        case 'penjualan_kasir':
            return {
                label: 'Penjualan POS',
                className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
            };
        case 'pembelian_bekas':
            return {
                label: 'Beli Laptop Bekas',
                className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
            };
        case 'pembelian_stok_sparepart':
            return {
                label: 'Stok Sparepart',
                className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800'
            };
        case 'operasional_toko':
            return {
                label: 'Operasional Toko',
                className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            };
        case 'pendapatan_lain':
            return {
                label: 'Pendapatan Lain',
                className: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
            };
        default:
            return {
                label: String(category).replace(/_/g, ' '),
                className: 'bg-muted text-muted-foreground border-border'
            };
    }
};

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
                        <TableCell>
                            {(() => {
                                const badgeInfo = getCategoryBadge(item.category);
                                return (
                                    <Badge variant="outline" className={`font-semibold text-[11px] ${badgeInfo.className}`}>
                                        {badgeInfo.label}
                                    </Badge>
                                );
                            })()}
                        </TableCell>
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
