import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bot, Terminal } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
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
            default:
                return <Badge variant="outline" className="capitalize">{intent.replace(/_/g, ' ')}</Badge>;
        }
    };

    const getResolverBadge = (resolver: string | null) => {
        if (!resolver) return <Badge variant="secondary">Proses / Error</Badge>;
        
        if (resolver === 'agent_nlp_fasttext') {
            return (
                <Badge variant="outline" className="border-indigo-200 text-indigo-600 bg-indigo-50">
                    <Bot className="w-3 h-3 mr-1" /> NLP Python (Utama)
                </Badge>
            );
        } else if (resolver === 'agent_intent_analyzer_fallback') {
            return (
                <Badge variant="outline" className="border-fuchsia-200 text-fuchsia-600 bg-fuchsia-50">
                    <Bot className="w-3 h-3 mr-1" /> LLM Groq (Fallback)
                </Badge>
            );
        } else if (resolver === 'agent_llm_customer_service') {
             return (
                <Badge variant="outline" className="border-sky-200 text-sky-600 bg-sky-50">
                    <Bot className="w-3 h-3 mr-1" /> LLM Groq (Penjawab)
                </Badge>
            );
        } else if (resolver === 'human') {
            return (
                <Badge variant="outline" className="border-amber-200 text-amber-600 bg-amber-50">
                    Admin / Manusia
                </Badge>
            );
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
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead title="Waktu pesan diterima atau dikirim">Waktu Pesan</TableHead>
                    <TableHead title="Nama dan Nomor WhatsApp pelanggan/bot">Pelanggan / Nomor</TableHead>
                    <TableHead title="Isi teks murni dari percakapan">Isi Pesan</TableHead>
                    <TableHead title="Niat (Intent) yang berhasil disimpulkan oleh AI">Keputusan Niat</TableHead>
                    <TableHead title="Tingkat keyakinan model NLP (SVM). Jika di bawah 75%, maka LLM Groq akan mengambil alih penentuan niat.">Skor Keyakinan (NLP)</TableHead>
                    <TableHead title="Pihak yang berhasil mengeksekusi pesan ini">Ditangani Oleh</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {logs.data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'dd MMM HH:mm:ss', { locale: id })}
                        </TableCell>
                        <TableCell>
                            <div className="font-semibold">{item.sender_name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{item.phone}</div>
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate" title={item.message}>
                            {item.message}
                        </TableCell>
                        <TableCell>
                            {getIntentBadge(item.final_intent)}
                        </TableCell>
                        <TableCell>
                            {item.svm_confidence_score !== null ? (
                                <span className={`text-xs font-mono ${item.is_svm_successful ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {(item.svm_confidence_score * 100).toFixed(1)}%
                                </span>
                            ) : '-'}
                        </TableCell>
                        <TableCell>
                            {getResolverBadge(item.resolved_by)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
