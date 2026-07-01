import { usePage, router } from '@inertiajs/react';
import { Bell, CheckCheck, Trash2, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

dayjs.extend(relativeTime);
dayjs.locale('id');

export function NotificationPopover() {
    const { auth } = usePage().props as any;

    const initialUnreadCount = auth?.user?.unread_notifications_count || 0;
    const initialNotifications = auth?.user?.notifications || [];

    const [hasUnread, setHasUnread] = useState(initialUnreadCount > 0);
    const [notifications, setNotifications] = useState<any[]>(initialNotifications);
    
    // Status koneksi Reverb manual
    const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

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
            onSuccess: () => setNotifications(prev => prev.filter(n => n.id !== id))
        });
    };

    useEffect(() => {
        // Jika window.Echo belum siap, tunggu sebentar (handling SSR Vite)
        if (typeof window === 'undefined' || !window.Echo) {
            setWsStatus('disconnected');
            return;
        }

        // 1. PANTAU KONEKSI REVERB SECARA NATIVE
        if (window.Echo.connector.pusher) {
            window.Echo.connector.pusher.connection.bind('connected', () => setWsStatus('connected'));
            window.Echo.connector.pusher.connection.bind('disconnected', () => setWsStatus('disconnected'));
            window.Echo.connector.pusher.connection.bind('error', () => setWsStatus('disconnected'));
        }

        if (auth?.user) {
            // 2. DENGARKAN NOTIF CS (GLOBAL)
            window.Echo.private('admin.notifications')
                .listen('ChatRequiresHuman', (e: any) => {
                    const msg = `Pelanggan butuh bantuan manual! (Nota: ${e.chatLog?.service_order_id || 'Unknown'})`;
                    toast.warning(msg, { duration: 8000 });
                    
                    const tempNotif = {
                        id: Math.random().toString(),
                        data: { type: 'chat', message: msg },
                        created_at: new Date().toISOString(),
                        read_at: null,
                    };
                    setHasUnread(true);
                    setNotifications(prev => [tempNotif, ...prev]);
                });

            // 3. DENGARKAN NOTIF SERVISAN BARU (PRIVATE)
            window.Echo.private(`App.Models.User.${auth.user.id}`)
                .notification((notification: any) => {
                    const pesan = notification.message || notification.data?.message || "Ada pemberitahuan baru!";
                    toast.success(pesan);
                    
                    const formattedNotif = {
                        id: notification.id || Math.random().toString(),
                        data: notification.data || notification,
                        created_at: notification.created_at || new Date().toISOString(),
                        read_at: null,
                    };

                    setHasUnread(true);
                    setNotifications(prev => [formattedNotif, ...prev]);
                });
        }

        // CLEANUP SAAT KOMPONEN DITUTUP
        return () => {
            if (typeof window !== 'undefined' && window.Echo) {
                window.Echo.leave('admin.notifications');
                if (auth?.user) window.Echo.leave(`App.Models.User.${auth.user.id}`);
            }
        };
    }, [auth?.user]);

    return (
        <div className="flex items-center gap-1">
            {/* INDIKATOR RADAR REVERB */}
            <div title={`Status Websocket: ${wsStatus}`} className="mr-1">
                {wsStatus === 'connected' ? (
                    <Wifi className="h-4 w-4 text-emerald-500" />
                ) : wsStatus === 'connecting' ? (
                    <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />
                ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                )}
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => setHasUnread(false)}>
                        <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                        {hasUnread && (
                            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 animate-pulse rounded-full border-2 border-background bg-red-500" />
                        )}
                    </Button>
                </PopoverTrigger>
                
                <PopoverContent className="w-96 p-0" align="end">
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
                            <div>
                                <h4 className="font-bold text-sm">Notifikasi</h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Pembaruan sistem & servis terbaru.</p>
                            </div>
                            {hasUnread && (
                                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700">
                                    <CheckCheck className="mr-1 h-3.5 w-3.5" /> Tandai Dibaca
                                </Button>
                            )}
                        </div>

                        <div className="max-h-[350px] overflow-y-auto p-2">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center flex flex-col items-center justify-center opacity-50">
                                    <Bell className="h-8 w-8 mb-2" />
                                    <p className="text-sm font-medium">Belum ada notifikasi.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {notifications.map((n) => {
                                        const isUnread = !n.read_at;
                                        return (
                                            <div key={n.id} className={`group relative flex flex-col gap-1 rounded-lg p-3 text-sm transition-colors ${isUnread ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'hover:bg-muted/50'}`}>
                                                {isUnread && <div className="absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full bg-blue-600" />}
                                                <div className={`pl-3 ${isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                                    {n.data?.message}
                                                </div>
                                                <div className="pl-3 flex items-center justify-between mt-1">
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {dayjs(n.created_at).fromNow()}
                                                    </span>
                                                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-100" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}>
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