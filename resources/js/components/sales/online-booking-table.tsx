import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Globe } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { PaginatedData } from '@/types/global';
import type { OnlineBooking } from '@/types/sales';

interface OnlineBookingTableProps {
    bookings: PaginatedData<OnlineBooking>;
}

export function OnlineBookingTable({ bookings }: OnlineBookingTableProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Menunggu</Badge>;
            case 'confirmed':
                return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Dikonfirmasi</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Selesai</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Dibatalkan</Badge>;
            case 'expired':
                return <Badge variant="secondary">Kedaluwarsa</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (bookings.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <Globe className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Kosong</h3>
                <p className="text-sm">Belum ada pesanan masuk dari jalur online.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>No. Booking</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Produk/Layanan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium font-mono">{item.booking_number}</TableCell>
                        <TableCell>
                            <div className="font-semibold">{item.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{item.customer_phone}</div>
                        </TableCell>
                        <TableCell>{item.product?.name || '-'}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                            {item.expires_at ? format(new Date(item.expires_at), 'dd MMM HH:mm', { locale: id }) : '-'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
