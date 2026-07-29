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

    const finalCost = service.financials?.final || service.final_cost;
    const estimatedCost = service.financials?.estimated || service.estimated_cost;
    const dp = service.financials?.dp || service.down_payment;
    
    const displayCostRaw = finalCost || estimatedCost;
    const costText = formatRupiah(displayCostRaw);
    const costLabel = finalCost ? 'Tagihan:' : (estimatedCost ? 'Est:' : '');
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

                    {service.technician_notes && (
                        <div className="mt-2 bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded text-[10px] text-blue-800/80 dark:text-blue-300/80 line-clamp-2 leading-snug border border-blue-100 dark:border-blue-800/50 flex items-start gap-1.5">
                            <span className="shrink-0 font-bold mt-0.5 text-[9px] uppercase tracking-wider opacity-60">Note:</span>
                            <span className="flex-1 italic">{service.technician_notes}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-end mt-3 pt-3 border-t border-border">
                        <span className="text-[10px] font-medium text-muted-foreground pb-0.5">
                            {service.created_at}
                        </span>
                        <div className="flex flex-col items-end gap-1">
                            {costText && (
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500">
                                    <span className="text-[9px] text-muted-foreground font-normal mr-1">{costLabel}</span>
                                    Rp {costText}
                                </span>
                            )}
                            {Number(dp) > 0 && (
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1 rounded">
                                    DP: Rp {formatRupiah(dp)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
