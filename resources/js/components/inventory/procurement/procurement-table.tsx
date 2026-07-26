import { ReceiptText } from 'lucide-react';
import Pagination from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PaginatedData } from '@/types/global';
import type { Procurement } from '@/types/procurement';

interface Props {
    procurements: PaginatedData<Procurement>;
}

export function ProcurementTable({ procurements }: Props) {
    // Fungsi bantuan untuk format Rupiah
    const formatRupiah = (angka: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(angka));
    };

    // Fungsi bantuan untuk format Tanggal
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px] text-center">No</TableHead>
                        <TableHead>Tanggal Transaksi</TableHead>
                        <TableHead>Keterangan & Supplier</TableHead>
                        <TableHead>Petugas (Admin)</TableHead>
                        <TableHead className="text-right">Total Uang Keluar</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {procurements.data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="py-8 text-center text-muted-foreground"
                            >
                                Belum ada riwayat pengadaan stok barang.
                            </TableCell>
                        </TableRow>
                    ) : (
                        procurements.data.map((p, index) => (
                            <TableRow key={p.id}>
                                <TableCell className="text-center">
                                    {(procurements.current_page - 1) * procurements.per_page + index + 1}
                                </TableCell>
                                
                                <TableCell className="font-medium whitespace-nowrap">
                                    {formatDate(p.transaction_date)}
                                </TableCell>
                                
                                <TableCell className="max-w-[300px]">
                                    <span className="truncate block" title={p.notes}>
                                        {p.notes}
                                    </span>
                                </TableCell>
                                
                                <TableCell>
                                    <Badge variant="secondary" className="capitalize shadow-none">
                                        {p.user.name}
                                    </Badge>
                                </TableCell>
                                
                                <TableCell className="text-right">
                                    <span className="font-mono font-bold text-destructive">
                                        - {formatRupiah(p.amount)}
                                    </span>
                                </TableCell>
                                
                                <TableCell className="text-center">
                                    <div className="flex justify-center gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-blue-600"
                                                    onClick={() => {
                                                        // Placeholder untuk fitur cetak/lihat nota masa depan
                                                        alert(`Detail Nota untuk Transaksi ID: ${p.id}\n${p.notes}`);
                                                    }}
                                                >
                                                    <ReceiptText className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">
                                                Lihat Bukti Nota
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Komponen Pagination persis seperti di PegawaiList */}
            <div className="border-t border-border">
                <Pagination
                    links={procurements.links}
                    from={procurements.from}
                    to={procurements.to}
                    total={procurements.total}
                />
            </div>
        </>
    );
}
