import { Link } from '@inertiajs/react';
import { Trash2, History } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
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
import type { Customer } from '@/types/customer';
import type { PaginatedData } from '@/types/global';
import { CustomerAlert } from './customer-alert';

export function CustomerTable({
    customers,
}: {
    customers: PaginatedData<Customer>;
}) {
    const [alertConfig, setAlertConfig] = useState<{
        open: boolean;
        type: 'delete' | null;
        customer: Customer | null;
    }>({ open: false, type: null, customer: null });

    const triggerAlert = (type: 'delete', customer: Customer) => {
        setAlertConfig({ open: true, type, customer });
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px] text-center">
                            No
                        </TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>No. Telepon</TableHead>
                        <TableHead>Alamat Singkat</TableHead>
                        <TableHead>Servisan</TableHead>
                        <TableHead>Kunjungan Terakhir</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="py-8 text-center text-muted-foreground"
                            >
                                Tidak ada data pelanggan yang ditemukan.
                            </TableCell>
                        </TableRow>
                    ) : (
                        customers.data.map((customer, idx) => (
                            <TableRow key={customer.id}>
                                <TableCell className="text-center">
                                    {(customers.current_page - 1) *
                                        customers.per_page +
                                        idx +
                                        1}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {customer.name}
                                </TableCell>
                                <TableCell>{customer.phone || '-'}</TableCell>
                                <TableCell className="max-w-[150px] truncate">
                                    {customer.address}
                                </TableCell>
                                <TableCell>
                                    {customer.service_orders_count > 0 ? (
                                        <Badge
                                            variant="secondary"
                                            className="font-normal"
                                        >
                                            {customer.service_orders_count}{' '}
                                            Riwayat Servis
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            -
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {customer.last_service_date}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        {customer.service_orders_count > 0 && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        asChild
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-blue-600"
                                                    >
                                                        {/* Arahkan ke halaman daftar pesanan servis yang sudah terfilter */}
                                                        <Link
                                                            href={`/services?search=${customer.phone}`}
                                                        >
                                                            <History className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs">
                                                    Lihat Riwayat Servis
                                                </TooltipContent>
                                            </Tooltip>
                                        )}

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() =>
                                                        triggerAlert(
                                                            'delete',
                                                            customer,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">
                                                Hapus Pelanggan
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Pagination
                links={customers.links}
                from={customers.from}
                to={customers.to}
                total={customers.total}
            />

            <CustomerAlert
                open={alertConfig.open}
                onOpenChange={(val) =>
                    !val && setAlertConfig((prev) => ({ ...prev, open: false }))
                }
                type={alertConfig.type}
                customer={alertConfig.customer}
            />
        </>
    );
}
