import { Clock, Wrench, CheckCircle, AlertCircle, ListTodo } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ServiceStatusTabsProps {
    status: string;
    onStatusChange: (status: string) => void;
}

export function ServiceStatusTabs({ status, onStatusChange }: ServiceStatusTabsProps) {
    return (
        <Tabs value={status} onValueChange={onStatusChange} className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-3 bg-transparent p-0 md:grid-cols-5">
                
                <TabsTrigger
                    value="all"
                    className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all data-[state=active]:border-slate-800 data-[state=active]:bg-slate-50 data-[state=active]:shadow-md"
                >
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <ListTodo className="h-4 w-4" /> Semua
                    </div>
                    <span className="text-xs font-normal text-slate-500">Tampilkan semua data</span>
                </TabsTrigger>

                <TabsTrigger
                    value="waiting_checking"
                    className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all data-[state=active]:border-pink-400 data-[state=active]:bg-pink-50 data-[state=active]:shadow-md"
                >
                    <div className="flex items-center gap-2 text-sm font-bold text-pink-700">
                        <AlertCircle className="h-4 w-4" /> Antrean Baru
                    </div>
                    <span className="text-xs font-normal text-slate-500">Belum dicek teknisi</span>
                </TabsTrigger>

                <TabsTrigger
                    value="waiting_approval"
                    className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all data-[state=active]:border-orange-400 data-[state=active]:bg-orange-50 data-[state=active]:shadow-md"
                >
                    <div className="flex items-center gap-2 text-sm font-bold text-orange-700">
                        <Clock className="h-4 w-4" /> Konfirmasi
                    </div>
                    <span className="text-xs font-normal text-slate-500">Tunggu balasan WA</span>
                </TabsTrigger>

                <TabsTrigger
                    value="in_progress"
                    className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all data-[state=active]:border-blue-400 data-[state=active]:bg-blue-50 data-[state=active]:shadow-md"
                >
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                        <Wrench className="h-4 w-4" /> Dikerjakan
                    </div>
                    <span className="text-xs font-normal text-slate-500">Sedang dieksekusi</span>
                </TabsTrigger>

                <TabsTrigger
                    value="completed"
                    className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all data-[state=active]:border-emerald-400 data-[state=active]:bg-emerald-50 data-[state=active]:shadow-md"
                >
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                        <CheckCircle className="h-4 w-4" /> Selesai
                    </div>
                    <span className="text-xs font-normal text-slate-500">Siap diambil/bayar</span>
                </TabsTrigger>

            </TabsList>
        </Tabs>
    );
}