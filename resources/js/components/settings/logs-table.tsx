import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bot, Terminal, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Pagination from '@/components/ui/pagination';
import type { PaginatedData } from '@/types/global';
import type { ChatLog } from '@/types/settings';

interface LogTableProps {
    logs: PaginatedData<ChatLog>;
}

export function LogTable({ logs }: LogTableProps) {
    const getIntentBadge = (intent: string | null) => {
        if (!intent) {
            return <span className="text-xs text-muted-foreground">-</span>;
        }
        
        switch (intent) {
            case 'setuju':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Setuju</Badge>;
            case 'batal':
                return <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">Batal</Badge>;
            case 'lainnya':
                return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">Lainnya</Badge>;
            default:
                return <Badge variant="outline" className="capitalize">{intent.replace(/_/g, ' ')}</Badge>;
        }
    };

    const getStateBadge = (status: string | null) => {
        if (!status) return <Badge variant="secondary" className="opacity-50">Menunggu</Badge>;

        switch (status) {
            case 'analyzing':
                return <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200">Menganalisa</Badge>;
            case 'processed':
                return <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-200">Diproses (OK)</Badge>;
            case 'handoff_triggered':
                return <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-200 font-medium">Handoff (Butuh Admin)</Badge>;
            case 'muted_waiting_for_admin':
                return <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200 border-dashed">Mute (Menunggu Admin)</Badge>;
            case 'muted_due_to_admin_activity':
                return <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200 border-dashed">Mute (Admin Aktif)</Badge>;
            case 'manual_reply':
                return <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-200">Balasan Admin</Badge>;
            case 'db_fallback_triggered':
                return <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">DB Fallback Triggered</Badge>;
            case 'db_fallback_reply':
                return <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">DB Fallback Reply</Badge>;
            default:
                return <Badge variant="secondary" className="capitalize text-[11px] text-muted-foreground border-dashed bg-transparent font-normal">{status.replace(/_/g, ' ')}</Badge>;
        }
    };

    const getResolverBadge = (resolver: string | null) => {
        if (!resolver || resolver === 'pending') {
            return (
                <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50/50 font-medium border-dashed">
                    Menunggu Antrean
                </Badge>
            );
        }
        
        if (resolver === 'nlp_model') {
            return (
                <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50 font-medium">
                    <Bot className="w-3 h-3 mr-1" /> NLP Klasifikasi
                </Badge>
            );
        } else if (resolver === 'llm_model') {
            return (
                <Badge variant="outline" className="border-sky-200 text-sky-700 bg-sky-50 font-medium">
                    <Bot className="w-3 h-3 mr-1" /> LLM Generatif
                </Badge>
            );
        } else if (resolver === 'human') {
            return (
                <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 font-medium">
                    Manusia Admin
                </Badge>
            );
        } else if (resolver === 'system') {
            return <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50 font-medium">System</Badge>;
        } else {
             return <Badge variant="secondary" className="capitalize">{resolver.replace(/_/g, ' ')}</Badge>;
        }
    };

    if (logs.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <Terminal className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Log Bersih</h3>
                <p className="text-sm">Belum ada aktivitas bot yang tercatat.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Pengirim</TableHead>
                        <TableHead>Pesan</TableHead>
                        <TableHead>Proses FSM</TableHead>
                        <TableHead>Klasifikasi Niat</TableHead>
                        <TableHead>Skor & Token</TableHead>
                        <TableHead>Ditangani</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.data.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                {format(new Date(item.created_at), 'dd MMM HH:mm:ss', { locale: id })}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-start gap-2.5">
                                    {item.direction === 'inbound' ? (
                                        <div className="mt-0.5 shrink-0 bg-emerald-100 text-emerald-700 p-1.5 rounded-full" title="Inbound (Pelanggan)">
                                            <ArrowDownLeft className="w-3.5 h-3.5" />
                                        </div>
                                    ) : (
                                        <div className="mt-0.5 shrink-0 bg-sky-100 text-sky-700 p-1.5 rounded-full" title="Outbound (Sistem/Bot)">
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold text-slate-900">{item.sender_name}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{item.phone}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="max-w-[250px] truncate" title={item.message}>
                                {item.message}
                            </TableCell>
                            <TableCell>
                                {getStateBadge(item.handling_status)}
                            </TableCell>
                            <TableCell>
                                {getIntentBadge(item.final_intent)}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1.5">
                                    {item.svm_confidence_score !== null ? (
                                        <span className={`text-[11px] px-1.5 py-0.5 rounded-sm font-mono font-medium inline-flex items-center w-fit ${item.is_svm_successful ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            NLP: {(item.svm_confidence_score * 100).toFixed(1)}%
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">-</span>
                                    )}
                                    
                                    {(item.llm_prompt_tokens || item.llm_completion_tokens) ? (
                                        <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-700 font-mono font-medium inline-flex items-center w-fit" title={`Prompt: ${item.llm_prompt_tokens || 0} | Completion: ${item.llm_completion_tokens || 0}`}>
                                            LLM: {(item.llm_prompt_tokens || 0) + (item.llm_completion_tokens || 0)} Tkn
                                        </span>
                                    ) : null}
                                </div>
                            </TableCell>
                            <TableCell>
                                {getResolverBadge(item.resolved_by)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            
            <div className="p-4 border-t">
                <Pagination links={logs.links} from={logs.from} to={logs.to} total={logs.total} />
            </div>
        </div>
    );
}
