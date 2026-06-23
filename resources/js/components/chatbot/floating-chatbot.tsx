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
        if (!chatInput.trim()) return;

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
                    // ⬅️ TANGKAP ERROR 422 DI SINI
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
                <Card className="mb-4 w-[350px] animate-in border-slate-200 shadow-2xl slide-in-from-bottom-5 fade-in">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 rounded-t-xl bg-blue-600 px-4 py-3 text-white">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <div>
                                <CardTitle className="text-base text-white">
                                    Tanya AI Assistant
                                </CardTitle>
                                <CardDescription className="text-xs text-blue-100">
                                    Sedang Online
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-blue-700"
                            onClick={() => setIsChatOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex h-[300px] flex-col gap-3 overflow-y-auto bg-slate-50 p-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div
                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${msg.role === 'assistant' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <Bot className="h-4 w-4" />
                                    ) : (
                                        <User className="h-4 w-4" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[85%] overflow-x-auto rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'rounded-tr-none bg-blue-600 text-white' : 'rounded-tl-none border bg-white text-slate-700 shadow-sm'}`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-sm prose-p:leading-relaxed prose-pre:bg-slate-100 prose-pre:text-slate-800 prose-th:border-b prose-th:border-slate-300 prose-td:border-b prose-td:border-slate-200 prose-th:py-2 prose-td:py-2 prose-th:text-left prose-a:text-blue-600 max-w-none">
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
                            <div className="flex flex-row gap-2">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="flex max-w-[80%] items-center gap-1 rounded-2xl rounded-tl-none border bg-white px-4 py-3 text-sm text-slate-500">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 delay-75"></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-2 rounded-b-xl border-t bg-white p-3"
                    >
                        <Input
                            placeholder="Tanya seputar servis..."
                            className="flex-1 focus-visible:ring-blue-600"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={!chatInput.trim() || isTyping}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </Card>
            )}

            <Button
                size="lg"
                className="h-14 w-14 rounded-full bg-blue-600 shadow-2xl hover:bg-blue-700"
                onClick={() => setIsChatOpen(!isChatOpen)}
            >
                {isChatOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <MessageCircle className="h-6 w-6" />
                )}
            </Button>
        </div>
    );
}
