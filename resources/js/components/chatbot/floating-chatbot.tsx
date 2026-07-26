import axios from 'axios';
import { Bot, MessageCircle, Send, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
}

export function FloatingChatbot() {
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [chatInput, setChatInput] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            text: 'Halo! Saya Asisten AI Anugerah Computer. Ada yang bisa saya bantu terkait harga laptop atau keluhan servis?',
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!chatInput.trim()) {
            return;
        }

        const userText = chatInput;
        setMessages((prev) => [...prev, { role: 'user', text: userText }]);
        setChatInput('');
        setIsTyping(true);

        try {
            const historyPayload = messages
                .filter((_, idx) => idx !== 0)
                .slice(-8)
                .map((m) => ({
                    role: m.role,
                    content: m.text,
                }));

            const response = await axios.post('/api/chatbot/ask', {
                message: userText,
                history: historyPayload,
            });

            if (response.data.status === 'success') {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', text: response.data.reply },
                ]);
            } else {
                throw new Error('Respons dari backend bukan success');
            }
        } catch (error: unknown) {
            console.error('Gagal memanggil API AI:', error);
            let errorMessage =
                'Maaf, saya sedang tidak bisa terhubung ke server. Hubungi via WA saja ya kak.';

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 429) {
                    errorMessage =
                        'Sistem sedang sibuk karena terlalu banyak pertanyaan. Mohon tunggu sebentar ya kak.';
                } else if (error.response?.status === 422) {
                    errorMessage =
                        'Pesan terlalu panjang. Silakan gunakan kalimat yang lebih singkat ya kak.';
                } else if (error.response?.data?.reply) {
                    errorMessage = error.response.data.reply;
                }
            }

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', text: errorMessage },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
            {isChatOpen && (
                <Card className="mb-6 w-[350px] overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-5 fade-in p-0 gap-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-white/10 bg-white/5 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-[0_0_15px_-3px_rgba(var(--primary),0.4)]">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-white">
                                    Tanya AI Assistant
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-primary">
                                    <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                                    Sedang Online
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
                            onClick={() => setIsChatOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex h-[320px] flex-col gap-4 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div
                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-inner ${msg.role === 'assistant' ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : 'bg-white/10 text-zinc-300 ring-1 ring-white/20'}`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <Bot className="h-4 w-4" />
                                    ) : (
                                        <User className="h-4 w-4" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-tr-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-[0_4px_15px_-3px_rgba(var(--primary),0.4)]' : 'rounded-tl-sm border border-white/10 bg-white/5 text-zinc-200'}`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-sm prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:text-zinc-200 prose-th:border-b prose-th:border-white/20 prose-td:border-b prose-td:border-white/10 prose-th:py-2 prose-td:py-2 prose-th:text-left prose-a:text-primary max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex flex-row gap-3">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/30 shadow-inner">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="flex max-w-[80%] items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-5 py-4 text-sm">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary delay-75"></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-3 border-t border-white/10 bg-white/5 p-4"
                    >
                        <Input
                            placeholder="Ketik pesan Anda..."
                            className="h-11 flex-1 rounded-xl border-white/10 bg-white/5 px-4 text-white placeholder-zinc-500 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-11 w-11 rounded-xl bg-primary text-primary-foreground shadow-[0_0_15px_-3px_rgba(var(--primary),0.4)] transition-transform hover:scale-105 hover:bg-primary/90"
                            disabled={!chatInput.trim() || isTyping}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </Card>
            )}

            <Button
                size="lg"
                className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_0_30px_-5px_rgba(var(--primary),0.6)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_40px_-5px_rgba(var(--primary),0.8)] border border-white/10"
                onClick={() => setIsChatOpen(!isChatOpen)}
            >
                {isChatOpen ? (
                    <X className="h-7 w-7" />
                ) : (
                    <MessageCircle className="h-7 w-7" />
                )}
            </Button>
        </div>
    );
}
