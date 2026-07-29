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
        if (!intent) return <Badge variant="secondary">Tidak Diketahui</Badge>;
        
        switch (intent) {
            case 'setuju':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Setuju</Badge>;
            case 'batal':
                return <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">Batal</Badge>;
            case 'lainnya':
                return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">Lainnya</Badge>;
            case 'llm_cs_reply':
                return <Badge variant="outline" className="bg-sky-50 text-sky-600 border-sky-200">Balasan LLM</Badge>;
            case 'tanya_status':
                return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Tanya Status</Badge>;
            default:
                return <Badge variant="outline" className="capitalize">{intent.replace(/_/g, ' ')}</Badge>;
        }
    };

    const getResolverBadge = (resolver: string | null) => {
        if (!resolver) return <Badge variant="secondary">Proses / Error</Badge>;
        
        if (resolver === 'agent_nlp_fasttext') {
            return (
                <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50 font-medium">
                    <Bot className="w-3 h-3 mr-1" /> NLP (Intent Recognition)
                </Badge>
            );
        } else if (resolver === 'agent_intent_analyzer_fallback') {
            return (
                <Badge variant="outline" className="border-fuchsia-200 text-fuchsia-700 bg-fuchsia-50 font-medium">
                    <Bot className="w-3 h-3 mr-1" /> LLM (Intent Fallback)
                </Badge>
            );
        } else if (resolver === 'agent_llm_customer_service') {
             return (
                <Badge variant="outline" className="border-sky-200 text-sky-700 bg-sky-50 font-medium">
                    <Bot className="w-3 h-3 mr-1" /> LLM (Generative Reply)
                </Badge>
            );
        } else if (resolver === 'human' || resolver === 'human_replied') {
            return (
                <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 font-medium">
                    Human Handoff (Admin)
                </Badge>
            );
        } else if (resolver === 'system') {
            return <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50 font-medium">Sistem (Auto)</Badge>;
        } else if (resolver === 'emergency_db_fallback') {
            return <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50 font-medium">Sistem (DB Fallback)</Badge>;
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
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead title="Waktu pesan diterima atau dikirim">Waktu Pesan</TableHead>
                            <TableHead title="Arah pesan (Masuk/Keluar) beserta nama Pengirim dan Nomor">Pengirim (Masuk / Keluar)</TableHead>
                            <TableHead title="Isi teks murni dari percakapan">Isi Pesan</TableHead>
                            <TableHead title="Niat (Intent) yang berhasil disimpulkan oleh AI">Keputusan Niat</TableHead>
                            <TableHead title="Tingkat keyakinan (SVM) dan penggunaan Token (LLM)">Skor AI & Token</TableHead>
                            <TableHead title="Pihak yang berhasil mengeksekusi pesan ini">Ditangani Oleh</TableHead>
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
                                            <div className="mt-0.5 shrink-0 bg-emerald-100 text-emerald-700 p-1.5 rounded-full" title="Pesan Masuk (Dari Pelanggan)">
                                                <ArrowDownLeft className="w-3.5 h-3.5" />
                                            </div>
                                        ) : (
                                            <div className="mt-0.5 shrink-0 bg-sky-100 text-sky-700 p-1.5 rounded-full" title="Pesan Keluar (Dari Sistem/Admin/Bot)">
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
            </div>
            
            <Pagination links={logs.links} from={logs.from} to={logs.to} total={logs.total} />
        </div>
    );
}
