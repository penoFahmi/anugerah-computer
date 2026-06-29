import { usePage, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bell, CheckCheck, Trash2, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import 'dayjs/locale/id';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

dayjs.extend(relativeTime);
dayjs.locale('id');

export function NotificationPopover() {
    const { auth } = usePage().props as any;

    const initialUnreadCount = auth?.user?.unread_notifications_count || 0;
    const initialNotifications = auth?.user?.notifications || [];

    const [hasUnread, setHasUnread] = useState(initialUnreadCount > 0);
    const [notifications, setNotifications] =
        useState<any[]>(initialNotifications);

    // RADAR STATUS REVERB (Biar kita tahu dia konek atau mati)
    const [wsStatus, setWsStatus] = useState<
        'connecting' | 'connected' | 'disconnected'
    >('connecting');

    const markAllAsRead = () => {
        router.post(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setHasUnread(false);
                    setNotifications((prev) =>
                        prev.map((n) => ({
                            ...n,
                            read_at: new Date().toISOString(),
                        })),
                    );
                },
            },
        );
    };

    const deleteNotification = (id: string) => {
        router.delete(`/notifications/${id}`, {
            preserveScroll: true,
            onSuccess: () =>
                setNotifications((prev) => prev.filter((n) => n.id !== id)),
        });
    };

    useEffect(() => {
        if (!window.Echo) {
            console.error(
                '❌ Obyek window.Echo TIDAK DITEMUKAN. Pastikan bootstrap.ts benar!',
            );
            setWsStatus('disconnected');
            return;
        }

        // 1. PANTAU KONEKSI REVERB
        window.Echo.connector.pusher.connection.bind('connected', () => {
            console.log('✅ REVERB KONEK SUKSES!');
            setWsStatus('connected');
        });
        window.Echo.connector.pusher.connection.bind('disconnected', () => {
            console.log('⚠️ REVERB TERPUTUS!');
            setWsStatus('disconnected');
        });
        window.Echo.connector.pusher.connection.bind('error', (err: any) => {
            console.error('❌ REVERB ERROR KONEKSI:', err);
            setWsStatus('disconnected');
        });

        if (auth?.user) {
            // 2. DENGARKAN NOTIF CS (GLOBAL)
            window.Echo.private('admin.notifications').listen(
                'ChatRequiresHuman',
                (e: any) => {
                    console.log('🔔 REVERB MENERIMA CHAT:', e);
                    const msg = `Pelanggan butuh bantuan manual! (Nota: ${e.chatLog.service_order_id})`;
                    toast.warning(msg, { duration: 8000 });

                    const tempNotif = {
                        id: Math.random().toString(),
                        data: { type: 'chat', message: msg },
                        created_at: new Date().toISOString(),
                        read_at: null,
                    };
                    setHasUnread(true);
                    setNotifications((prev) => [tempNotif, ...prev]);
                },
            );

            // 3. DENGARKAN NOTIF SERVISAN BARU (PRIVATE)
            const userChannel = `App.Models.User.${auth.user.id}`;
            console.log(`Mencoba berlangganan ke channel: ${userChannel}`);

            window.Echo.private(userChannel)
                // Tangkap event notifikasi standar Laravel
                .listen(
                    '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
                    (e: any) => {
                        console.log('🔔 REVERB MENERIMA NOTIFIKASI!', e);

                        const pesan =
                            e.message ||
                            e.data?.message ||
                            'Ada pemberitahuan baru!';
                        toast.success(pesan);

                        const formattedNotif = {
                            id: e.id,
                            data: e.data || e,
                            created_at:
                                e.created_at || new Date().toISOString(),
                            read_at: null,
                        };

                        setHasUnread(true);
                        setNotifications((prev) => [formattedNotif, ...prev]);
                    },
                );
        }

        return () => {
            if (window.Echo) {
                window.Echo.leave('admin.notifications');
                if (auth?.user)
                    window.Echo.leave(`App.Models.User.${auth.user.id}`);
            }
        };
    }, [auth?.user]);

    return (
        <div className="flex items-center gap-1">
            {/* INDIKATOR RADAR REVERB */}
            <div title={`Status Websocket: ${wsStatus}`}>
                {wsStatus === 'connected' ? (
                    <Wifi className="h-4 w-4 text-emerald-500" />
                ) : wsStatus === 'connecting' ? (
                    <Wifi className="h-4 w-4 animate-pulse text-yellow-500" />
                ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                )}
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9"
                        onClick={() => setHasUnread(false)}
                    >
                        <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                        {hasUnread && (
                            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 animate-pulse rounded-full border-2 border-background bg-red-500" />
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-96 p-0" align="end">
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                            <div>
                                <h4 className="text-sm font-bold">
                                    Notifikasi
                                </h4>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    Pembaruan sistem & servis terbaru.
                                </p>
                            </div>
                            {hasUnread && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700"
                                >
                                    <CheckCheck className="mr-1 h-3.5 w-3.5" />{' '}
                                    Tandai Dibaca
                                </Button>
                            )}
                        </div>

                        <div className="max-h-[350px] overflow-y-auto p-2">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                                    <Bell className="mb-2 h-8 w-8" />
                                    <p className="text-sm font-medium">
                                        Belum ada notifikasi.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {notifications.map((n) => {
                                        const isUnread = !n.read_at;
                                        return (
                                            <div
                                                key={n.id}
                                                className={`group relative flex flex-col gap-1 rounded-lg p-3 text-sm transition-colors ${isUnread ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'hover:bg-muted/50'}`}
                                            >
                                                {isUnread && (
                                                    <div className="absolute top-4 left-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                                                )}
                                                <div
                                                    className={`pl-3 ${isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                                                >
                                                    {n.data?.message}
                                                </div>
                                                <div className="mt-1 flex items-center justify-between pl-3">
                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        {dayjs(
                                                            n.created_at,
                                                        ).fromNow()}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(
                                                                n.id,
                                                            );
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
