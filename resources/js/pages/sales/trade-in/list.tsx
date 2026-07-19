import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Plus, Search, FilterX } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { TradeInTable } from '@/components/sales/trade-in-table';
import { TradeInFormModal } from '@/components/sales/trade-in-form-modal';
import type { TradeInPageProps } from '@/types/sales';

export default function TradeInList({ tradeIns, filters }: TradeInPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const applyFilters = (value: string) => {
        const query: Record<string, string> = {};
        if (value) query.search = value;
        router.get('/sales/trade-in', query, { preserveState: true, replace: true });
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
            <Head title="Pembelian Bekas" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Pembelian Bekas (Trade In)</h2>
                        <p className="text-muted-foreground">Catat dan pantau perangkat bekas yang dibeli dari pelanggan.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Tambah Pembelian
                    </Button>
                </div>

                <TradeInFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

                <div className="flex items-center gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari transaksi (nama/nota)..."
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
                        <CardTitle>Riwayat Transaksi</CardTitle>
                        <CardDescription>Daftar perangkat bekas yang telah Anda beli.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TradeInTable tradeIns={tradeIns} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TradeInList.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pembelian' }, { title: 'Pembelian Bekas', href: '/sales/trade-in' }]}>
        {page}
    </AppLayout>
);
