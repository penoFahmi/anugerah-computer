import { Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { ServiceListItem } from '@/types/service';

interface KanbanCardProps {
    service: ServiceListItem;
    index: number;
    onClick: () => void;
}

export function KanbanCard({ service, index, onClick }: KanbanCardProps) {
    // Fungsi formatting currency yang lebih aman (Safe Parsing)
    const formatRupiah = (angka: string | number | null | undefined): string | null => {
        if (!angka || Number(angka) === 0) return null;
        return new Intl.NumberFormat('id-ID').format(Number(angka));
    };

    const cost = formatRupiah(service.estimated_cost);
    const isWarrantyClaim = service.complaint.includes('[KLAIM GARANSI');

    return (
        <Draggable draggableId={service.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={onClick}
                    className={`group bg-card text-card-foreground p-3 rounded-lg border border-border shadow-sm hover:border-ring hover:ring-1 hover:ring-ring/50 cursor-pointer transition-all ${
                        snapshot.isDragging ? 'rotate-1 scale-105 shadow-lg ring-2 ring-primary/50 z-50' : ''
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-muted-foreground border-border bg-transparent shadow-none">
                            {service.order_number}
                        </Badge>
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    <h4 className="font-bold text-sm text-foreground leading-tight mb-1">
                        {service.device_name}
                    </h4>
                    
                    <p className="text-[11px] font-medium text-muted-foreground mb-2.5">
                        A.n: {service.customer_name}
                    </p>

                    {/* Indikator Khusus Klaim Garansi */}
                    {isWarrantyClaim && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-300 shadow-none px-1.5 py-0 text-[9px] mb-2 w-full justify-center dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                            KLAIM GARANSI
                        </Badge>
                    )}

                    {/* Indikator Lokasi Unit (Hanya untuk Batal atau Inden/In Progress yg dibawa pulang) */}
                    {service.status === 'cancelled' && (
                        <Badge variant="outline" className={`px-1.5 py-0 text-[9px] mb-2 w-full justify-center border-dashed ${service.is_unit_left_at_store ? 'border-amber-400 text-amber-600 dark:text-amber-400' : 'border-rose-400 text-rose-600 dark:text-rose-400'}`}>
                            {service.is_unit_left_at_store ? 'UNIT MASIH DI TOKO' : 'UNIT SUDAH DIKEMBALIKAN'}
                        </Badge>
                    )}
                    
                    {service.status === 'in_progress' && !service.is_unit_left_at_store && (
                        <Badge variant="outline" className="px-1.5 py-0 text-[9px] mb-2 w-full justify-center border-orange-400 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20">
                            UNIT DIBAWA PELANGGAN (INDEN)
                        </Badge>
                    )}

                    <div className="bg-muted/30 p-2 rounded text-[11px] text-muted-foreground line-clamp-2 leading-snug border border-border/50">
                        {service.complaint.replace(/\[KLAIM GARANSI.*?\]/g, '').trim()}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                        <span className="text-[10px] font-medium text-muted-foreground">
                            {service.created_at}
                        </span>
                        {cost && (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500">
                                Rp {cost}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
}
