import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import { CustomerAlert } from './customer-alert';
import type { PaginatedCustomer, Customer } from '@/types/customer';

export function CustomerTable({ customers }: { customers: PaginatedCustomer }) {
    const [alertConfig, setAlertConfig] = useState<{
        open: boolean;
        type: 'delete' | null;
        customer: Customer | null;
    }>({
        open: false,
        type: null,
        customer: null,
    });

    const triggerAlert = (type: 'delete', customer: Customer) => {
        setAlertConfig({ open: true, type, customer });
    };

    const getRelativeUrl = (absoluteUrl: string | null) => {
        if (!absoluteUrl) return null;
        try {
            const url = new URL(absoluteUrl);
            return url.pathname + url.search;
        } catch {
            return absoluteUrl;
        }
    };

    // Fungsi Parser Label Pagination agar Bersih dari tag aneh Laravel
    const parsePaginationLabel = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('prev')) return '‹ Sebelumnya';
        if (lowerLabel.includes('next')) return 'Selanjutnya ›';
        return label;
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Nama</TableHead>
                        <TableHead>No. Telepon</TableHead>
                        <TableHead>Servisan</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="py-8 text-center text-muted-foreground"
                            >
                                Tidak ada data pelanggan yang ditemukan.
                            </TableCell>
                        </TableRow>
                    ) : (
                        customers.data.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell className="font-medium">
                                    {customer.name}
                                </TableCell>
                                <TableCell>{customer.phone || '-'}</TableCell>
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
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() =>
                                                triggerAlert('delete', customer)
                                            }
                                            title="Hapus Akun"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row">
                <div>
                    Menampilkan {customers.from || 0} - {customers.to || 0} dari{' '}
                    {customers.total} pelanggan
                </div>
                <div className="flex flex-wrap gap-1">
                    {customers.links.map((link, idx) => {
                        const relativeUrl = getRelativeUrl(link.url);
                        const labelHtml = parsePaginationLabel(link.label);

                        return (
                            <Button
                                key={idx}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!relativeUrl}
                                onClick={() =>
                                    relativeUrl &&
                                    router.get(
                                        relativeUrl,
                                        {},
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    )
                                }
                                className={`h-8 px-3 ${link.active ? 'pointer-events-none' : ''}`}
                            >
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: labelHtml,
                                    }}
                                />
                            </Button>
                        );
                    })}
                </div>
            </div>

            <CustomerAlert
                open={alertConfig.open}
                onOpenChange={(val) =>
                    setAlertConfig((prev) => ({ ...prev, open: val }))
                }
                type={alertConfig.type}
                customer={alertConfig.customer}
            />
        </>
    );
}
