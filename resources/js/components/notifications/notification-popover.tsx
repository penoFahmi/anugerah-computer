import { usePage, router } from '@inertiajs/react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
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
            
            // Tampilkan toast sesuai tipe
            if (notification.data?.type === 'chat_alert') {
                toast.error(pesan, { duration: 8000 });
            } else if (notification.data?.type === 'chat_message') {
                toast.info(pesan);
            } else {
                toast.success(pesan);
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
                
                // Jika ini notifikasi chat, buka Modal Chat Global
                if (n.data?.type === 'chat_alert' || n.data?.type === 'chat_message') {
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
                                        return (
                                            <div 
                                                key={n.id} 
                                                onClick={() => handleNotificationClick(n)}
                                                className={`group relative flex flex-col gap-1 rounded-md p-2.5 text-xs transition-colors cursor-pointer ${
                                                    isUnread 
                                                        ? 'bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-100/40 dark:hover:bg-blue-950/40' 
                                                        : 'hover:bg-muted/60'
                                                }`}
                                            >
                                                {isUnread && <div className="absolute left-1.5 top-3.5 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />}
                                                
                                                <div className={`pl-2.5 pr-6 leading-relaxed ${isUnread ? 'font-bold text-foreground' : 'text-muted-foreground font-medium'}`}>
                                                    {n.data?.message}
                                                </div>
                                                
                                                <div className="pl-2.5 flex items-center justify-between mt-1">
                                                    <span className="text-[9px] font-semibold text-slate-400 font-mono">
                                                        {dayjs(n.created_at).fromNow()}
                                                    </span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10" 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            deleteNotification(n.id); 
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
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