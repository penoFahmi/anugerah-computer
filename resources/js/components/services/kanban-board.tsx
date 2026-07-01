import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { router } from '@inertiajs/react';
import { Clock, Wrench, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { ServiceProcessModal } from '@/components/services/service-process-modal';
import { KanbanCard } from '@/components/services/kanban-card';
import type { ServiceListItem } from '@/types/service';

// Definisi Kolom Statis (Disesuaikan dengan Enum ServiceStatus)
const COLUMNS = [
    { id: 'waiting_checking', title: 'Antrean Baru', icon: AlertCircle, color: 'border-pink-300 bg-pink-50', headerBg: 'bg-pink-100 text-pink-800' },
    { id: 'waiting_approval', title: 'Menunggu Konfirmasi', icon: Clock, color: 'border-orange-300 bg-orange-50', headerBg: 'bg-orange-100 text-orange-800' },
    { id: 'approved', title: 'Disetujui', icon: Play, color: 'border-teal-300 bg-teal-50', headerBg: 'bg-teal-100 text-teal-800' },
    { id: 'in_progress', title: 'Dikerjakan', icon: Wrench, color: 'border-blue-300 bg-blue-50', headerBg: 'bg-blue-100 text-blue-800' },
    { id: 'completed', title: 'Selesai (Siap Diambil)', icon: CheckCircle, color: 'border-emerald-300 bg-emerald-50', headerBg: 'bg-emerald-100 text-emerald-800' },
];

interface KanbanBoardProps {
    services: ServiceListItem[];
}

export function KanbanBoard({ services }: KanbanBoardProps) {
    // State lokal untuk memfasilitasi "Optimistic UI Update"
    const [boardData, setBoardData] = useState<ServiceListItem[]>(services);
    const [selectedService, setSelectedService] = useState<ServiceListItem | null>(null);

    // Sinkronisasi data dari backend saat props services berubah
    useEffect(() => {
        setBoardData(services);
    }, [services]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        // 1. Batalkan jika di-drop di luar zona atau tidak ada perpindahan posisi
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const newStatus = destination.droppableId;
        const draggedService = boardData.find(s => s.id.toString() === draggableId);

        if (!draggedService) return;

        // 2. OPTIMISTIC UI UPDATE: Perbarui UI secara instan agar terasa sangat cepat
        const updatedBoard = boardData.map(s => 
            s.id === draggedService.id ? { ...s, status: newStatus } : s
        );
        setBoardData(updatedBoard);

        // 3. Sinkronisasi perubahan ke Backend (Database)
        router.put(`/services/${draggedService.id}`, { 
            status: newStatus,
            is_full_update: false,
        }, {
            preserveScroll: true,
            onError: () => {
                // ROLLBACK: Jika server gagal menyimpan, kembalikan posisi kartu ke awal
                toast.error('Gagal memindah status secara otomatis. Silakan isi form operasional secara manual.');
                setBoardData(services); 
                setSelectedService(draggedService); // Buka modal agar teknisi bisa input alasan/catatan
            }
        });
    };

    return (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex h-full gap-4 items-start w-max min-w-full">
                    {COLUMNS.map(column => {
                        const columnServices = boardData.filter(s => s.status === column.id);
                        const Icon = column.icon;

                        return (
                            <div key={column.id} className={`flex flex-col h-full w-[320px] rounded-xl border ${column.color} shadow-sm shrink-0`}>
                                
                                <div className={`flex items-center justify-between p-3 border-b border-black/10 rounded-t-xl ${column.headerBg}`}>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <Icon className="h-4 w-4" />
                                        {column.title}
                                    </div>
                                    <Badge variant="secondary" className="bg-white/50 text-black shadow-none border-0">
                                        {columnServices.length}
                                    </Badge>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div 
                                            ref={provided.innerRef} 
                                            {...provided.droppableProps}
                                            className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${
                                                snapshot.isDraggingOver ? 'bg-black/5' : ''
                                            }`}
                                        >
                                            {columnServices.map((service, index) => (
                                                <KanbanCard
                                                    key={service.id}
                                                    service={service}
                                                    index={index}
                                                    onClick={() => setSelectedService(service)}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {/* Modal Form Operasional untuk mengedit biaya/catatan */}
            <ServiceProcessModal 
                isOpen={!!selectedService} 
                onClose={() => setSelectedService(null)} 
                service={selectedService} 
            />
        </div>
    );
}