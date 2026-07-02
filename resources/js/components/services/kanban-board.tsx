import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { router } from '@inertiajs/react';
import { Clock, Wrench, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { KanbanCard } from '@/components/services/kanban-card';
import { ServiceProcessModal } from '@/components/services/service-process-modal';
import { Badge } from '@/components/ui/badge';
import type { ServiceListItem } from '@/types/service';

// PERBAIKAN: Menambahkan class "dark:" pada setiap kolom agar menyesuaikan dengan Dark Mode
const COLUMNS = [
    { 
        id: 'waiting_checking', 
        title: 'Antrean Baru', 
        icon: AlertCircle, 
        color: 'border-pink-300 bg-pink-50 dark:border-pink-900/50 dark:bg-pink-950/20', 
        headerBg: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300' 
    },
    { 
        id: 'waiting_approval', 
        title: 'Menunggu Konfirmasi', 
        icon: Clock, 
        color: 'border-orange-300 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20', 
        headerBg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' 
    },
    { 
        id: 'approved', 
        title: 'Disetujui', 
        icon: Play, 
        color: 'border-teal-300 bg-teal-50 dark:border-teal-900/50 dark:bg-teal-950/20', 
        headerBg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300' 
    },
    { 
        id: 'in_progress', 
        title: 'Dikerjakan', 
        icon: Wrench, 
        color: 'border-blue-300 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20', 
        headerBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' 
    },
    { 
        id: 'completed', 
        title: 'Selesai (Siap Diambil)', 
        icon: CheckCircle, 
        color: 'border-emerald-300 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20', 
        headerBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
    },
];

interface KanbanBoardProps {
    services: ServiceListItem[];
}

export function KanbanBoard({ services }: KanbanBoardProps) {
    const [boardData, setBoardData] = useState<ServiceListItem[]>(services);
    const [selectedService, setSelectedService] = useState<ServiceListItem | null>(null);

    useEffect(() => {
        setBoardData(services);
    }, [services]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const newStatus = destination.droppableId;
        const draggedService = boardData.find(s => s.id.toString() === draggableId);

        if (!draggedService) return;

        // Optimistic UI Update
        const updatedBoard = boardData.map(s => s.id === draggedService.id ? { ...s, status: newStatus } : s);
        setBoardData(updatedBoard);

        // Eksekusi pembaruan ke backend
        router.put(`/services/${draggedService.id}`, { 
            status: newStatus,
            is_full_update: false,
        }, {
            preserveScroll: true,
            onError: () => {
                toast.error('Gagal memindah status secara otomatis. Silakan isi form operasional secara manual.');
                setBoardData(services);
                setSelectedService(draggedService);
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
                                
                                {/* PERBAIKAN: Menggunakan border-border agar menyesuaikan tema terang/gelap */}
                                <div className={`flex items-center justify-between p-3 border-b border-border/50 rounded-t-xl ${column.headerBg}`}>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <Icon className="h-4 w-4" />
                                        {column.title}
                                    </div>
                                    {/* PERBAIKAN: Badge jumlah kartu menggunakan bg-background dan text-foreground */}
                                    <Badge variant="secondary" className="bg-background/60 text-foreground shadow-none border-0 dark:bg-background/40">
                                        {columnServices.length}
                                    </Badge>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div 
                                            ref={provided.innerRef} 
                                            {...provided.droppableProps}
                                            /* PERBAIKAN: dark:bg-white/5 saat kartu digeser di atasnya */
                                            className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${
                                                snapshot.isDraggingOver ? 'bg-black/5 dark:bg-white/5' : ''
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

            <ServiceProcessModal 
                isOpen={!!selectedService} 
                onClose={() => setSelectedService(null)} 
                service={selectedService} 
            />
        </div>
    );
}