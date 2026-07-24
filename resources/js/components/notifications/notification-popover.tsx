import { usePage, router } from '@inertiajs/react';
import { Bell, CheckCheck, Trash2, MessageSquareWarning, Laptop, Hourglass, CheckCircle2, XCircle, PartyPopper } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

// MENGGUNAKAN HOOKS RESMI DARI LARAVEL ECHO REACT
import { useEcho, useConnectionStatus } from '@laravel/echo-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

dayjs.extend(relativeTime);
dayjs.locale('id');

interface DatabaseNotification {
    id: string;
    data: { message: string; action_url?: string; type?: string };
    created_at: string;
    read_at: string | null;
}

export function NotificationPopover() {
    const { auth } = usePage<any>().props;

    const initialUnreadCount = auth?.user?.unread_notifications_count || 0;
    const initialNotifications = auth?.user?.notifications || [];

    const [hasUnread, setHasUnread] = useState(initialUnreadCount > 0);
    const [notifications, setNotifications] = useState<DatabaseNotification[]>(initialNotifications);

    // 1. PANTAU KONEKSI REVERB MENGGUNAKAN HOOK BAWAAN (Bukan window.Echo)
    const wsStatus = useConnectionStatus(); 

    // 2. DENGARKAN NOTIFIKASI DATABASE LARAVEL ASLI (Termasuk Chat Masuk & Panggilan Manual)
    const { channel } = useEcho(`App.Models.User.${auth?.user?.id}`);
    
    useEffect(() => {
        if (!channel) return;

        // Mendengarkan broadcast spesifik notifikasi Laravel
        channel().notification((notification: any) => {
            const pesan = notification.message || notification.data?.message || "Ada pemberitahuan sistem baru!";
            const tipe = notification.data?.type;
            const judul = notification.data?.title || 'Notifikasi';
            
            // Tampilkan toast sesuai tipe
            if (tipe === 'chat_alert') {
                const phone = notification.chatLog?.phone || notification.data?.chat_log?.phone || 'Pelanggan';
                toast.error(judul, { 
                    duration: 10000,
                    description: pesan,
                    action: {
                        label: 'Balas',
                        onClick: () => {
                            window.dispatchEvent(new CustomEvent('open-global-chat', { detail: { phone } }));
                        }
                    }
                });
            } else if (tipe === 'service_new') {
                toast.info(judul, { description: pesan });
            } else if (tipe === 'service_waiting') {
                toast.warning(judul, { description: pesan, duration: 8000 });
            } else if (tipe === 'service_completed' || tipe === 'service_approved') {
                toast.success(judul, { description: pesan });
            } else if (tipe === 'service_cancelled') {
                toast.error(judul, { description: pesan });
            } else {
                toast(judul, { description: pesan });
            }
            
            const formattedNotif: DatabaseNotification = {
                id: notification.id || Math.random().toString(),
                data: notification.data || { type: 'system', message: pesan },
                created_at: notification.created_at || new Date().toISOString(),
                read_at: null,
            };

            setHasUnread(true);
            setNotifications(prev => [formattedNotif, ...prev]);
        });

    }, [channel]);

    const handleNotificationClick = (n: DatabaseNotification) => {
        // Tandai dibaca ke database Laravel
        router.post(`/notifications/${n.id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item));
                const stillHasUnread = notifications.some(item => item.id !== n.id && !item.read_at);
                setHasUnread(stillHasUnread);
                
                // Jika ini peringatan darurat chat, buka Modal Chat Global
                if (n.data?.type === 'chat_alert') {
                    // Ambil nomor HP dari payload chat_log
                    const phone = (n.data as any).chat_log?.phone;
                    if (phone) {
                        window.dispatchEvent(new CustomEvent('open-global-chat', { detail: { phone } }));
                    }
                } else if (n.data?.action_url) {
                    router.visit(n.data.action_url);
                }
            }
        });
    };

    const markAllAsRead = () => {
        router.post('/notifications/read-all', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setHasUnread(false);
                setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            }
        });
    };

    const deleteNotification = (id: string) => {
        router.delete(`/notifications/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setNotifications(prev => prev.filter(n => n.id !== id));
                const stillHasUnread = notifications.filter(n => n.id !== id).some(n => !n.read_at);
                setHasUnread(stillHasUnread);
            }
        });
    };

    return (
        <div className="flex items-center gap-1">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9">
                        <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                        {hasUnread && (
                            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 animate-pulse rounded-full border border-background bg-red-500" />
                        )}
                    </Button>
                </PopoverTrigger>
                
                <PopoverContent className="w-96 p-0 border-border bg-card" align="end">
                    {/* ... (Konten notifikasi sama seperti kode sebelumnya, 100% menggunakan styling milikmu) ... */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-muted/30">
                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-wide">Pusat Notifikasi</h4>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Pembaruan sistem & operasional terpadu.</p>
                            </div>
                            {hasUnread && (
                                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 px-2 text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                    <CheckCheck className="mr-1 h-3.5 w-3.5" /> Bersihkan Lonceng
                                </Button>
                            )}
                        </div>

                        <div className="max-h-[320px] overflow-y-auto p-1.5 custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center flex flex-col items-center justify-center opacity-40">
                                    <Bell className="h-6 w-6 mb-2 text-muted-foreground" />
                                    <p className="text-xs font-semibold">Kotak masuk bersih.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {notifications.map((n) => {
                                        const isUnread = !n.read_at;
                                        
                                        // Tentukan Ikon dan Warna berdasarkan Tipe Notifikasi
                                        let Icon = Bell;
                                        let iconColor = 'text-slate-500';
                                        let iconBg = 'bg-slate-100 dark:bg-slate-800';
                                        let title = n.data?.title || 'Pemberitahuan Sistem';

                                        switch(n.data?.type) {
                                            case 'chat_alert':
                                                Icon = MessageSquareWarning;
                                                iconColor = 'text-blue-500';
                                                iconBg = 'bg-blue-100 dark:bg-blue-900/30';
                                                break;
                                            case 'service_new':
                                                Icon = Laptop;
                                                iconColor = 'text-purple-500';
                                                iconBg = 'bg-purple-100 dark:bg-purple-900/30';
                                                break;
                                            case 'service_waiting':
                                                Icon = Hourglass;
                                                iconColor = 'text-amber-500';
                                                iconBg = 'bg-amber-100 dark:bg-amber-900/30';
                                                break;
                                            case 'service_approved':
                                                Icon = CheckCircle2;
                                                iconColor = 'text-emerald-500';
                                                iconBg = 'bg-emerald-100 dark:bg-emerald-900/30';
                                                break;
                                            case 'service_cancelled':
                                                Icon = XCircle;
                                                iconColor = 'text-red-500';
                                                iconBg = 'bg-red-100 dark:bg-red-900/30';
                                                break;
                                            case 'service_completed':
                                                Icon = PartyPopper;
                                                iconColor = 'text-emerald-600';
                                                iconBg = 'bg-emerald-100 dark:bg-emerald-900/30';
                                                break;
                                        }

                                        return (
                                            <div 
                                                key={n.id} 
                                                onClick={() => handleNotificationClick(n)}
                                                className={`group relative flex gap-3 rounded-md p-3 transition-colors cursor-pointer border border-transparent ${
                                                    isUnread 
                                                        ? 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/80 hover:border-blue-100 dark:hover:border-blue-900/50' 
                                                        : 'hover:bg-muted/60 hover:border-border/50'
                                                }`}
                                            >
                                                {/* Unread Dot */}
                                                {isUnread && <div className="absolute left-1 top-4 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500 shadow-sm shadow-blue-500/50" />}
                                                
                                                {/* Icon */}
                                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                                                    <Icon className={`h-4 w-4 ${iconColor}`} />
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex flex-1 flex-col overflow-hidden">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className={`truncate text-[11px] uppercase tracking-wider ${isUnread ? 'font-bold text-slate-800 dark:text-slate-200' : 'font-semibold text-slate-500 dark:text-slate-400'}`}>
                                                            {title}
                                                        </span>
                                                        <span className="shrink-0 text-[9px] font-medium text-slate-400 font-mono mt-0.5">
                                                            {dayjs(n.created_at).fromNow()}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className={`mt-0.5 pr-6 text-xs leading-relaxed ${isUnread ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {n.data?.message}
                                                    </div>
                                                </div>

                                                {/* Delete Button (Hover Only) */}
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-full" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        deleteNotification(n.id); 
                                                    }}
                                                    title="Hapus notifikasi"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}