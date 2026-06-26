import { Clock, Wrench, CheckCircle, AlertCircle, ListTodo } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ServiceStatusTabsProps {
    status: string;
    onStatusChange: (status: string) => void;
}

export function ServiceStatusTabs({ status, onStatusChange }: ServiceStatusTabsProps) {
    return (
        <div className="w-full">
            <Tabs value={status} onValueChange={onStatusChange} className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-2 items-stretch gap-3 bg-transparent p-0 md:grid-cols-5">
                    
                    <TabsTrigger
                        value="all"
                        className="flex h-auto w-full flex-col items-start justify-start gap-1 whitespace-normal rounded-xl border p-4 text-left shadow-sm transition-all bg-card data-[state=active]:border-foreground data-[state=active]:bg-muted data-[state=active]:shadow-md"
                    >
                        <div className="flex items-center gap-2 text-sm font-bold text-card-foreground">
                            <ListTodo className="h-4 w-4 text-muted-foreground" /> Semua
                        </div>
                        <span className="text-xs font-normal text-muted-foreground">Tampilkan semua data</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="waiting_checking"
                        className="flex h-auto w-full flex-col items-start justify-start gap-1 whitespace-normal rounded-xl border p-4 text-left shadow-sm transition-all bg-card data-[state=active]:border-pink-400 data-[state=active]:bg-pink-500/10 dark:data-[state=active]:bg-pink-950/30 data-[state=active]:shadow-md"
                    >
                        <div className="flex items-center gap-2 text-sm font-bold text-pink-600 dark:text-pink-400">
                            <AlertCircle className="h-4 w-4" /> Antrean Baru
                        </div>
                        <span className="text-xs font-normal text-muted-foreground">Belum dicek teknisi</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="waiting_approval"
                        className="flex h-auto w-full flex-col items-start justify-start gap-1 whitespace-normal rounded-xl border p-4 text-left shadow-sm transition-all bg-card data-[state=active]:border-orange-400 data-[state=active]:bg-orange-500/10 dark:data-[state=active]:bg-orange-950/30 data-[state=active]:shadow-md"
                    >
                        <div className="flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-400">
                            <Clock className="h-4 w-4" /> Konfirmasi
                        </div>
                        <span className="text-xs font-normal text-muted-foreground">Tunggu balasan WA</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="in_progress"
                        className="flex h-auto w-full flex-col items-start justify-start gap-1 whitespace-normal rounded-xl border p-4 text-left shadow-sm transition-all bg-card data-[state=active]:border-blue-400 data-[state=active]:bg-blue-500/10 dark:data-[state=active]:bg-blue-950/30 data-[state=active]:shadow-md"
                    >
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                            <Wrench className="h-4 w-4" /> Dikerjakan
                        </div>
                        <span className="text-xs font-normal text-muted-foreground">Sedang dieksekusi</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="completed"
                        className="flex h-auto w-full flex-col items-start justify-start gap-1 whitespace-normal rounded-xl border p-4 text-left shadow-sm transition-all bg-card data-[state=active]:border-emerald-400 data-[state=active]:bg-emerald-500/10 dark:data-[state=active]:bg-emerald-950/30 data-[state=active]:shadow-md"
                    >
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="h-4 w-4" /> Selesai
                        </div>
                        <span className="text-xs font-normal text-muted-foreground">Siap diambil/bayar</span>
                    </TabsTrigger>

                </TabsList>
            </Tabs>
        </div>
    );
}