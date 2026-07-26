import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { router } from '@inertiajs/react';
import { Clock, Wrench, CheckCircle, AlertCircle, Play, XCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

import { KanbanCard } from '@/components/services/kanban-card';
import { ServiceProcessModal } from '@/components/services/service-process-modal';
import { Badge } from '@/components/ui/badge';
import type { ServiceListItem } from '@/types/service';

const COLUMNS = [
    { 
        id: 'waiting_checking', 
        title: 'Antrean Baru', 
        icon: AlertCircle, 
        color: 'text-pink-500',
        badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
    },
    { 
        id: 'waiting_approval', 
        title: 'Menunggu Konfirmasi', 
        icon: Clock, 
        color: 'text-orange-500',
        badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
    },
    { 
        id: 'approved', 
        title: 'Disetujui', 
        icon: Play, 
        color: 'text-teal-500',
        badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
    },
    { 
        id: 'in_progress', 
        title: 'Dikerjakan', 
        icon: Wrench, 
        color: 'text-blue-500',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    },
    { 
        id: 'completed', 
        title: 'Selesai (Siap Diambil)', 
        icon: CheckCircle, 
        color: 'text-emerald-500',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    },
    {
        id: 'cancelled',
        title: 'Batal',
        icon: XCircle,
        color: 'text-red-500',
        badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    },
];

interface KanbanBoardProps {
    services: ServiceListItem[];
    available_spare_parts?: any[];
}

export function KanbanBoard({ services, available_spare_parts }: KanbanBoardProps) {
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

    const scrollRef = useRef<HTMLDivElement>(null);
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const onMouseDown = (e: React.MouseEvent) => {
        // Jangan aktifkan pan jika sedang mengklik elemen interaktif (tombol, link, kartu)
        const target = e.target as HTMLElement;
        if (target.closest('.group') || target.closest('button')) return;

        isDown.current = true;
        if (scrollRef.current) {
            scrollRef.current.classList.add('cursor-grabbing');
            scrollRef.current.classList.remove('cursor-grab');
            startX.current = e.pageX - scrollRef.current.offsetLeft;
            scrollLeft.current = scrollRef.current.scrollLeft;
        }
    };

    const onMouseLeave = () => {
        isDown.current = false;
        if (scrollRef.current) {
            scrollRef.current.classList.remove('cursor-grabbing');
            scrollRef.current.classList.add('cursor-grab');
        }
    };

    const onMouseUp = () => {
        isDown.current = false;
        if (scrollRef.current) {
            scrollRef.current.classList.remove('cursor-grabbing');
            scrollRef.current.classList.add('cursor-grab');
        }
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDown.current || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 1.5; // Kecepatan geser
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    return (
        <div 
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar select-none cursor-grab"
        >
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex h-full gap-4 items-start w-max min-w-full">
                    {COLUMNS.map(column => {
                        const columnServices = boardData.filter(s => s.status === column.id);
                        const Icon = column.icon;

                        return (
                            <div key={column.id} className="flex flex-col h-full w-[320px] rounded-xl border border-border bg-muted/10 shrink-0">
                                
                                <div className="flex items-center justify-between p-3 border-b border-border/50">
                                    <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                                        <Icon className={`h-4 w-4 ${column.color}`} />
                                        {column.title}
                                    </div>
                                    <Badge variant="secondary" className={`shadow-none border-0 ${column.badgeColor}`}>
                                        {columnServices.length}
                                    </Badge>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div 
                                            ref={provided.innerRef} 
                                            {...provided.droppableProps}
                                            className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${
                                                snapshot.isDraggingOver ? 'bg-muted/30' : ''
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
                available_spare_parts={available_spare_parts}
            />
        </div>
    );
}
