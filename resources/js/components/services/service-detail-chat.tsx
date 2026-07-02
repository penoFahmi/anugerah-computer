import { Loader2, Send } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { ServiceListItem } from '@/types/service';

interface ChatMessage {
    id: number; 
    direction: 'inbound' | 'outbound'; 
    message: string; 
    resolved_by: string | null; 
    created_at: string;
}

interface ServiceDetailChatProps {
    service: ServiceListItem & { customer?: any };
}

declare global {
    interface Window {
        Echo: any;
    }
}

export function ServiceDetailChat({ service }: ServiceDetailChatProps) {
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
            .then((data: ChatMessage[]) => { 
                setMessages(data); 
                setLoading(false); 
                setTimeout(scrollToBottom, 100); 
            });

        if (typeof window !== 'undefined' && window.Echo) {
            window.Echo.private(`chat.service.${service.id}`)
                .listen('NewChatMessage', (e: { chat: ChatMessage }) => {
                    setMessages(prev => [...prev, e.chat]);
                    setTimeout(scrollToBottom, 100);
                });
        }

        return () => {
            if (typeof window !== 'undefined' && window.Echo && service) {
                window.Echo.leave(`chat.service.${service.id}`);
            }
        };
    }, [service]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        const text = newMessage;
        setNewMessage('');

        try {
            await fetch(`/services/${service.id}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ message: text }),
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        /* HARUS h-full overflow-hidden agar tertahan dalam Tabs Content */
        <div className="flex flex-col h-full w-full border border-border rounded-xl overflow-hidden bg-card shadow-sm">
            
            {/* Header Chat (Shrink 0) */}
            <div className="bg-emerald-600 dark:bg-emerald-700 p-3 text-white shrink-0 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-sm leading-none">WhatsApp Pelanggan</h3>
                    <p className="text-[11px] text-emerald-100 font-mono mt-1 opacity-90">{service.customer?.phone}</p>
                </div>
            </div>
            
            {/* Area Chat yang bisa di-scroll mandiri (flex-1 overflow-y-auto) */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5] dark:bg-slate-900/80 flex flex-col gap-3 custom-scrollbar">
                {loading ? (
                    <div className="m-auto">
                        <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="m-auto text-xs text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md">
                        Belum ada percakapan.
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.direction === 'outbound';
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-2.5 text-sm shadow-sm ${
                                    isMe 
                                        ? 'rounded-tr-none bg-[#d9fdd3] text-slate-800 dark:bg-emerald-800 dark:text-emerald-50' 
                                        : 'rounded-tl-none bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-border/50'
                                }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                    <div className="mt-1.5 text-right text-[9px] opacity-70 font-medium">
                                        {msg.resolved_by === 'human' && 'CS Manual'}
                                        {msg.resolved_by === 'llm' && '✨ AI Response'}
                                        {msg.resolved_by === 'system' && '⚙️ Sistem'}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form (Shrink 0) terkunci di bawah */}
            <form onSubmit={handleSend} className="p-3 bg-muted border-t border-border flex gap-2 shrink-0">
                <Input 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    placeholder="Ketik balasan WhatsApp..." 
                    className="bg-background text-sm h-9 border-border/60 focus-visible:ring-emerald-500" 
                    autoComplete="off"
                />
                <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 h-9 w-9 shadow-sm">
                    <Send className="h-4 w-4" />
                </Button>
            </form>

        </div>
    );
}