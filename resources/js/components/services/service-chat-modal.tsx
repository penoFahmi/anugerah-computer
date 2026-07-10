import { Loader2, Send } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { ServiceListItem } from '@/types/service';
import { useEcho } from '@laravel/echo-react';

interface ChatMessage {
    id: number;
    direction: 'inbound' | 'outbound';
    message: string;
    resolved_by: string | null;
    created_at: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceListItem | null;
}

export function ServiceChatModal({ isOpen, onClose, service }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isOpen || !service) return;

        const fetchMessages = async () => {
            setLoading(true);
            const res = await fetch(`/services/${service.id}/chat`);
            const data = await res.json();
            setMessages(data);
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        };

        fetchMessages();
    }, [isOpen, service]);
    // 2. [PERBAIKAN]: Dengarkan pesan baru dengan useEcho
    useEcho('admin.notifications', '.chat.new_message', (e: any) => {
        // FILTER: Pastikan pesan yang masuk benar-benar milik nota yang sedang dibuka ini
        if (
            isOpen &&
            service &&
            e.chatLog &&
            e.chatLog.service_order_id === service.id
        ) {
            setMessages((prev) => [...prev, e.chatLog]);
            setTimeout(scrollToBottom, 100);
        }
    });

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !service) return;

        const textToSend = newMessage;
        setNewMessage(''); // Kosongkan input langsung agar responsif

        try {
            await fetch(`/services/${service.id}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ message: textToSend }),
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (!service) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex h-[80vh] flex-col overflow-hidden p-0 sm:max-w-[450px]">
                <DialogHeader className="border-b bg-emerald-600 p-4 text-white">
                    <DialogTitle className="flex items-center gap-2 text-white">
                        Live Chat: {service.customer_name}
                    </DialogTitle>
                    <p className="text-xs text-emerald-100 opacity-80">
                        {service.customer_phone}
                    </p>
                </DialogHeader>

                <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#e5ddd5] p-4 dark:bg-slate-900">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="animate-spin text-emerald-600" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="my-auto rounded-lg bg-white/50 p-2 text-center text-xs text-muted-foreground">
                            Belum ada percakapan.
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.direction === 'outbound';
                            return (
                                <div
                                    key={idx}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-2.5 text-sm shadow-sm ${
                                            isMe
                                                ? 'rounded-tr-none bg-[#d9fdd3] text-slate-800 dark:bg-emerald-800 dark:text-emerald-50'
                                                : 'rounded-tl-none bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">
                                            {msg.message}
                                        </p>
                                        <div className="mt-1 text-right text-[10px] opacity-60">
                                            {msg.resolved_by === 'human' &&
                                                '⚠️ Butuh Bantuan'}
                                            {msg.resolved_by === 'llm' &&
                                                '🤖 AI'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form
                    onSubmit={handleSend}
                    className="flex gap-2 border-t bg-muted/50 p-3"
                >
                    <Input
                        placeholder="Ketik balasan..."
                        className="flex-1 bg-background"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
