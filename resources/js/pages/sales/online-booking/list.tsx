import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FilterX } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { OnlineBookingTable } from '@/components/sales/online-booking-table';
import type { OnlineBookingPageProps } from '@/types/sales';

export default function OnlineBookingList({ bookings, filters }: OnlineBookingPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (value: string) => {
        const query: Record<string, string> = {};
        if (value) query.search = value;
        router.get('/sales/online', query, { preserveState: true, replace: true });
    };

    const handleSearchDebounce = useDebouncedCallback((value: string) => {
        applyFilters(value);
    }, 400);

    const resetFilters = () => {
        setSearch('');
        applyFilters('');
    };

    return (
        <>
            <Head title="Pesanan Daring" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Pesanan Daring</h2>
                    <p className="text-muted-foreground">Kelola pesanan atau *booking* yang masuk dari pelanggan via internet.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari pelanggan/nomor booking..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleSearchDebounce(e.target.value);
                            }}
                        />
                    </div>
                    {search && (
                        <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filter">
                            <FilterX className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Antrean Booking</CardTitle>
                        <CardDescription>Daftar pelanggan yang telah melakukan reservasi online.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OnlineBookingTable bookings={bookings} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

OnlineBookingList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Penjualan' }, { title: 'Pesanan Daring', href: '/sales/online' }]}>
        {page}
    </AppLayout>
);
