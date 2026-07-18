import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart } from 'lucide-react';
import type { ProfitLossReportItem } from '@/types/finance';

interface ProfitLossTableProps {
    reports: ProfitLossReportItem[];
    year: number;
}

export function ProfitLossTable({ reports, year }: ProfitLossTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (reports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <LineChart className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Belum Ada Data</h3>
                <p className="text-sm">Tidak ada transaksi yang tercatat pada tahun {year}.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Bulan</TableHead>
                    <TableHead className="text-right">Pemasukan (Omset)</TableHead>
                    <TableHead className="text-right">Pengeluaran (Beban)</TableHead>
                    <TableHead className="text-right">Laba/Rugi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reports.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{item.month}</TableCell>
                        <TableCell className="text-right text-emerald-600">{formatCurrency(item.income)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(item.expense)}</TableCell>
                        <TableCell className={`text-right font-bold ${item.profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                            {formatCurrency(item.profit)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
