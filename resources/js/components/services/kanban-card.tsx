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
    const formatRupiah = (angka: string | number | null | undefined) => {
        if (!angka || Number(angka) === 0) return null;
        return new Intl.NumberFormat('id-ID').format(Number(angka));
    };

    const cost = formatRupiah(service.estimated_cost);

    return (
        <Draggable draggableId={service.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={onClick}
                    className={`group bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition-all ${
                        snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-blue-500' : ''
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-slate-500 border-slate-300">
                            {service.order_number}
                        </Badge>
                        <MoreHorizontal className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                    
                    <h4 className="font-bold text-sm text-slate-800 leading-tight mb-1">
                        {service.device_name}
                    </h4>
                    <p className="text-xs font-medium text-slate-600 mb-3">
                        A.n: {service.customer_name}
                    </p>

                    {service.complaint.includes('[KLAIM GARANSI') && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-300 shadow-none px-1.5 py-0 text-[9px] mb-2 w-full justify-center">
                            KLAIM GARANSI
                        </Badge>
                    )}

                    <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-500 line-clamp-2 leading-snug border border-slate-100">
                        {service.complaint.replace(/\[KLAIM GARANSI.*?\]/g, '').trim()}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                        <span className="text-[10px] font-medium text-slate-400">
                            {service.created_at}
                        </span>
                        {cost && (
                            <span className="text-[11px] font-bold text-emerald-600">
                                Rp {cost}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
}