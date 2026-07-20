import { Loader2, Send, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEcho } from '@laravel/echo-react';

interface ChatMessage {
    id: number;
    direction: 'inbound' | 'outbound';
    message: string;
    resolved_by: string | null;
    created_at: string;
}

export function GlobalChatModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [phone, setPhone] = useState('');

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const handleOpenChat = (e: any) => {
            setPhone(e.detail.phone);
            setIsOpen(true);
        };
        window.addEventListener('open-global-chat', handleOpenChat as EventListener);
        return () => window.removeEventListener('open-global-chat', handleOpenChat as EventListener);
    }, []);

    useEffect(() => {
        if (!isOpen || !phone) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/chats/${phone}`);
                const data = await res.json();
                setMessages(data);
                setTimeout(scrollToBottom, 100);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [isOpen, phone]);

    // Menggunakan ref untuk menghindari stale closure pada callback WebSocket
    const activeChatRef = useRef({ isOpen, phone });
    useEffect(() => {
        activeChatRef.current = { isOpen, phone };
    }, [isOpen, phone]);

    useEcho('admin.notifications', '.chat.new_message', (e: any) => {
        const { isOpen: currentIsOpen, phone: currentPhoneStr } = activeChatRef.current;
        
        if (currentIsOpen && currentPhoneStr && e.chatLog && e.chatLog.phone) {
            const incomingPhone = e.chatLog.phone.replace(/^(62|0)/, '');
            const currentPhone = currentPhoneStr.replace(/^(62|0)/, '');

            if (incomingPhone === currentPhone) {
                setMessages((prev) => {
                    // Cek duplikasi agar tidak render 2x
                    if (prev.find(m => m.id === e.chatLog.id)) return prev;
                    return [...prev, e.chatLog];
                });
                setTimeout(scrollToBottom, 100);
            }
        }
    });

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !phone) return;

        const textToSend = newMessage;
        setNewMessage('');

        try {
            await fetch(`/api/chats/${phone}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ message: textToSend }),
            });
            
        } catch (error) {
            console.error(error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex h-[500px] w-[350px] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl sm:w-[400px]">
            <div className="flex items-center justify-between border-b bg-emerald-600 p-3 text-white">
                <div>
                    <h3 className="font-bold text-sm">Live Chat WA</h3>
                    <p className="text-[10px] text-emerald-100 font-mono">{phone}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 text-white hover:bg-emerald-700 rounded-full">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#e5ddd5] p-4 dark:bg-slate-900 custom-scrollbar">
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
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-2.5 text-sm shadow-sm ${isMe ? 'rounded-tr-none bg-[#d9fdd3] text-slate-800 dark:bg-emerald-800 dark:text-emerald-50' : 'rounded-tl-none bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200'}`}>
                                    <p className="whitespace-pre-wrap text-xs">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-2 border-t bg-muted/50 p-2">
                <Input placeholder="Ketik pesan..." className="flex-1 bg-background text-sm" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                <Button type="submit" size="icon" className="bg-emerald-600 text-white hover:bg-emerald-700 shrink-0">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
