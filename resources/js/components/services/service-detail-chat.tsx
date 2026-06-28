import { Loader2, Send } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
    id: number; direction: 'inbound' | 'outbound'; message: string; resolved_by: string | null; created_at: string;
}

export function ServiceDetailChat({ service }: { service: any }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => {
        if (!service) return;
        setLoading(true);
        fetch(`/services/${service.id}/chat`)
            .then(res => res.json())
            .then(data => { setMessages(data); setLoading(false); setTimeout(scrollToBottom, 100); });

        if (window.Echo) {
            window.Echo.private(`chat.service.${service.id}`)
                .listen('NewChatMessage', (e: any) => {
                    setMessages(prev => [...prev, e.chat]);
                    setTimeout(scrollToBottom, 100);
                });
        }
        return () => {
            if (window.Echo && service) window.Echo.leave(`chat.service.${service.id}`);
        };
    }, [service]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const text = newMessage;
        setNewMessage('');

        await fetch(`/services/${service.id}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({ message: text }),
        });
    };

    return (
        <div className="flex flex-col h-full border border-border rounded-xl overflow-hidden bg-background">
            <div className="bg-emerald-600 p-3 text-white shrink-0">
                <h3 className="font-bold text-sm">WhatsApp Pelanggan</h3>
                <p className="text-xs text-emerald-100 font-mono">{service.customer?.phone}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5] dark:bg-slate-900 flex flex-col gap-3">
                {loading ? <div className="m-auto"><Loader2 className="animate-spin text-emerald-600" /></div> :
                    messages.map((msg, idx) => {
                        const isMe = msg.direction === 'outbound';
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] rounded-lg p-2.5 text-sm shadow-sm ${isMe ? 'rounded-tr-none bg-[#d9fdd3] text-slate-800 dark:bg-emerald-800 dark:text-emerald-50' : 'rounded-tl-none bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200'}`}>
                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                    <div className="mt-1 text-right text-[9px] opacity-60">
                                        {msg.resolved_by === 'human' && 'CS Manual'}
                                        {msg.resolved_by === 'llm' && 'AI Response'}
                                        {msg.resolved_by === 'system' && 'Sistem'}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-muted border-t flex gap-2 shrink-0">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Ketik pesan..." className="bg-background text-sm" />
                <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"><Send className="h-4 w-4" /></Button>
            </form>
        </div>
    );
}