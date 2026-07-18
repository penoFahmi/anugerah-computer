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
            case 'service_status':
            case 'check_service':
                return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Cek Servis</Badge>;
            case 'price_inquiry':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Tanya Harga</Badge>;
            case 'human_escalation':
                return <Badge variant="destructive">Eskalasi CS</Badge>;
            default:
                return <Badge variant="outline">{intent}</Badge>;
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
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pengirim</TableHead>
                    <TableHead>Pesan</TableHead>
                    <TableHead>Intent AI</TableHead>
                    <TableHead>Akurasi (SVM)</TableHead>
                    <TableHead>Penyelesai</TableHead>
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
                            {item.resolved_by === 'ai' ? (
                                <Badge variant="outline" className="border-indigo-200 text-indigo-600 bg-indigo-50">
                                    <Bot className="w-3 h-3 mr-1" /> AI
                                </Badge>
                            ) : item.resolved_by === 'human' ? (
                                <Badge variant="outline" className="border-amber-200 text-amber-600 bg-amber-50">
                                    Admin
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Proses</Badge>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
