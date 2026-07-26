import AppLogoIcon from '@/components/app-logo-icon';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export default function AppLogo() {
    const { name } = usePage<SharedData>().props;
    
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate leading-none font-bold tracking-tight">
                    {name || 'Anugerah Computer'}
                </span>
                <span className="truncate text-[10px] font-medium text-muted-foreground mt-0.5">
                    ERP Workspace
                </span>
            </div>
        </>
    );
}
