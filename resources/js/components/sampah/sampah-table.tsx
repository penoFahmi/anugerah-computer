import { RefreshCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { PaginatedData } from '@/types/global';
import type { TrashItem } from '@/types/sampah';
import { TrashAlert } from './sampah-alert';

interface Props {
    trashItems: PaginatedData<TrashItem>;
}

export function TrashTable({ trashItems }: Props) {
    const [alertConfig, setAlertConfig] = useState<{
        open: boolean;
        action: 'restore' | 'force_delete' | null;
        item: TrashItem | null;
    }>({ open: false, action: null, item: null });

    const triggerAlert = (action: 'restore' | 'force_delete', item: TrashItem) => {
        setAlertConfig({ open: true, action, item });
    };

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'pegawai': return 'default';
            case 'customer': return 'secondary';
            case 'servis': return 'outline';
            default: return 'outline';
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

            <Pagination 
                links={trashItems.links} 
                from={trashItems.from} 
                to={trashItems.to} 
                total={trashItems.total} 
            />

            <TrashAlert
                open={alertConfig.open}
                onOpenChange={(val) => !val && setAlertConfig((prev) => ({ ...prev, open: false }))}
                action={alertConfig.action}
                item={alertConfig.item}
            />
        </>
    );
}
