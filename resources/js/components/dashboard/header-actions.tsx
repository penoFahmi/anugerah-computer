import { usePage } from '@inertiajs/react';
import { Bell, Moon, Sun, User } from 'lucide-react';
import { UserMenuContent } from '@/components/dashboard/user-menu-content';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export function HeaderActions() {
    const { auth } = usePage().props;
    const isMobile = useIsMobile();
    const toggleTheme = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
    const { state } = useSidebar();

    return (
        <div className="flex items-center gap-2">
            {/* 1. TOMBOL UBAH TEMA */}
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="h-9 w-9"
                aria-label="Toggle theme"
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* 2. NOTIFIKASI */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                    <div className="grid gap-4">
                        <div className="space-y-2 border-b pb-2">
                            <h4 className="font-medium leading-none">Notifikasi</h4>
                            <p className="text-sm text-muted-foreground">
                                Kamu memiliki pesan masuk baru.
                            </p>
                        </div>
                        <div className="py-4 text-center text-sm text-muted-foreground">
                            Tidak ada notifikasi baru.
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* 3. MENU PROFIL (Bungkus Kecil & Seragam) */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <Avatar className="size-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={auth.user?.avatar}
                                alt={auth.user?.name} />
                            <AvatarFallback>
                                <User className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                ? 'left'
                                  : 'bottom'
                        }
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}