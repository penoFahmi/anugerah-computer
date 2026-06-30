import { Clock, Wrench, CheckCircle, AlertCircle, ListTodo } from 'lucide-react';

interface ServiceStatusTabsProps {
    status: string;
    onStatusChange: (status: string) => void;
}

export function ServiceStatusTabs({ status, onStatusChange }: ServiceStatusTabsProps) {
    const tabs = [
        {
            value: 'all',
            label: 'Semua',
            desc: 'Tampilkan semua',
            icon: ListTodo,
            activeClass: 'border-slate-800 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900',
            inactiveClass: 'border-border bg-card text-foreground hover:bg-slate-100 dark:hover:bg-slate-800',
            iconClass: 'text-slate-400 dark:text-slate-500'
        },
        {
            value: 'waiting_checking',
            label: 'Antrean Baru',
            desc: 'Belum dicek',
            icon: AlertCircle,
            activeClass: 'border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-700',
            inactiveClass: 'border-border bg-card text-foreground hover:bg-pink-50/50 dark:hover:bg-pink-950/20',
            iconClass: 'text-pink-500'
        },
        {
            value: 'waiting_approval',
            label: 'Konfirmasi',
            desc: 'Tunggu balasan WA',
            icon: Clock,
            activeClass: 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-700',
            inactiveClass: 'border-border bg-card text-foreground hover:bg-orange-50/50 dark:hover:bg-orange-950/20',
            iconClass: 'text-orange-500'
        },
        {
            value: 'in_progress',
            label: 'Dikerjakan',
            desc: 'Sedang dieksekusi',
            icon: Wrench,
            activeClass: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700',
            inactiveClass: 'border-border bg-card text-foreground hover:bg-blue-50/50 dark:hover:bg-blue-950/20',
            iconClass: 'text-blue-500'
        },
        {
            value: 'completed',
            label: 'Selesai',
            desc: 'Siap diambil/bayar',
            icon: CheckCircle,
            activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700',
            inactiveClass: 'border-border bg-card text-foreground hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
            iconClass: 'text-emerald-500'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 w-full h-auto">
            {tabs.map((tab) => {
                const isActive = status === tab.value;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.value}
                        onClick={() => onStatusChange(tab.value)}
                        className={`flex flex-col items-start justify-start p-3 sm:p-4 rounded-xl border text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isActive ? tab.activeClass + ' shadow-md scale-[1.02] ring-1 ring-ring/50' : tab.inactiveClass + ' shadow-sm'
                        }`}
                    >
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <Icon className={`h-4 w-4 ${isActive ? 'currentColor' : tab.iconClass}`} />
                            {tab.label}
                        </div>
                        <span className={`text-[11px] sm:text-xs mt-1.5 font-medium ${isActive ? 'opacity-90' : 'text-muted-foreground'}`}>
                            {tab.desc}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}