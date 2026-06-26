import { router } from '@inertiajs/react';
import { RefreshCcw, Trash2 } from 'lucide-react';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PaginatedTrash, TrashItem } from '@/types/sampah';
import { TrashAlert } from './sampah-alert';

export function TrashTable({ trashItems }: { trashItems: PaginatedTrash }) {
    const [alertConfig, setAlertConfig] = useState<{
        open: boolean;
        action: 'restore' | 'force_delete' | null;
        item: TrashItem | null;
    }>({ open: false, action: null, item: null });

    const triggerAlert = (action: 'restore' | 'force_delete', item: TrashItem) => {
        setAlertConfig({ open: true, action, item });
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

    const parsePaginationLabel = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('prev')) return '‹ Sebelumnya';
        if (lowerLabel.includes('next')) return 'Selanjutnya ›';
        return label;
    };

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'pegawai':
                return 'default';
            case 'servis':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 border-b">
                        <TableHead className="w-[60px] text-center">No</TableHead>
                        <TableHead className="w-[150px]">Kategori</TableHead>
                        <TableHead>Informasi Data</TableHead>
                        <TableHead>Waktu Dihapus</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {trashItems.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                Tidak ada data yang ditemukan di Tempat Sampah.
                            </TableCell>
                        </TableRow>
                    ) : (
                        trashItems.data.map((item, idx) => (
                            <TableRow key={`${item.type}-${item.id}-${idx}`}>
                                <TableCell className="text-center">
                                    {(trashItems.current_page - 1) * trashItems.per_page + idx + 1}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getBadgeVariant(item.type)} className="capitalize shadow-none">
                                        {item.category_label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {item.data_info}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {item.deleted_at}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                            onClick={() => triggerAlert('restore', item)}
                                        >
                                            <RefreshCcw className="mr-1 h-4 w-4" /> Pulihkan
                                        </Button>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-8"
                                                    onClick={() => triggerAlert('force_delete', item)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">
                                                Hapus Permanen
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row">
                <div>
                    Menampilkan {trashItems.from || 0} - {trashItems.to || 0} dari {trashItems.total} data
                </div>
                <div className="flex flex-wrap gap-1">
                    {trashItems.links.map((link, idx) => {
                        const relativeUrl = getRelativeUrl(link.url);
                        return (
                            <Button
                                key={idx}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!relativeUrl}
                                onClick={() =>
                                    relativeUrl &&
                                    router.get(relativeUrl, {}, { preserveState: true, preserveScroll: true })
                                }
                                className={`h-8 px-3 ${link.active ? 'pointer-events-none' : ''}`}
                            >
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: parsePaginationLabel(link.label),
                                    }}
                                />
                            </Button>
                        );
                    })}
                </div>
            </div>

            <TrashAlert
                open={alertConfig.open}
                onOpenChange={(val) => !val && setAlertConfig((prev) => ({ ...prev, open: false }))}
                action={alertConfig.action}
                item={alertConfig.item}
            />
        </>
    );
}
