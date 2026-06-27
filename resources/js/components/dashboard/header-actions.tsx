import { usePage } from '@inertiajs/react';
import { Bell, Moon, Sun, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { UserMenuContent } from '@/components/dashboard/user-menu-content';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useSidebar } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { useIsMobile } from '@/hooks/use-mobile';

export function HeaderActions() {
    const { auth } = usePage().props as any;
    const isMobile = useIsMobile();
    const { state } = useSidebar();
    const { appearance, updateAppearance } = useAppearance();

    const [hasUnread, setHasUnread] = useState(false);
    const [notifications, setNotifications] = useState<string[]>([]);

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        if (window.Echo) {
            window.Echo.private('admin.notifications').listen(
                'ChatRequiresHuman',
                (e: any) => {
                    const msg = `Pelanggan butuh bantuan manual! (Nota: ${e.chatLog.service_order_id})`;
                    toast.warning(msg, { duration: 8000 });
                    setHasUnread(true);
                    setNotifications((prev) => [msg, ...prev]);
                },
            );
        }

        return () => {
            if (window.Echo) window.Echo.leave('admin.notifications');
        };
    }, []);

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
            >
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </Button>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9"
                        onClick={() => setHasUnread(false)}
                    >
                        <Bell className="h-5 w-5" />
                        {hasUnread && (
                            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 animate-pulse rounded-full bg-destructive" />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                    <div className="grid gap-4">
                        <div className="space-y-2 border-b pb-2">
                            <h4 className="leading-none font-medium">
                                Notifikasi
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Status panggilan dari AI.
                            </p>
                        </div>
                        <div className="max-h-48 overflow-y-auto py-2 text-sm text-muted-foreground">
                            {notifications.length === 0 ? (
                                <p className="text-center">
                                    Tidak ada notifikasi baru.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((n, i) => (
                                        <div
                                            key={i}
                                            className="rounded-md border-l-4 border-orange-500 bg-muted p-2 text-xs"
                                        >
                                            {n}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                    >
                        <Avatar className="size-8 overflow-hidden rounded-full">
                            <AvatarImage src={auth.user?.avatar} />
                            <AvatarFallback>
                                <User className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="min-w-56 rounded-lg"
                    align="end"
                >
                    <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
