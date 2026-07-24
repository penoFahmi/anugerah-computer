import { ArrowLeft, Loader2, Send, X, MessageSquare, User, GripHorizontal, MessageCircle } from 'lucide-react';
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

interface Contact {
    phone: string;
    last_activity: string;
    last_message: string;
    customer_name: string | null;
    unread_count: number;
}

export function GlobalChatWidget() {
    // 1. Widget State (Collapsed/FAB vs Expanded/Modal)
    const [isExpanded, setIsExpanded] = useState(false);
    
    // 2. View State inside Expanded Modal
    const [view, setView] = useState<'contacts' | 'chat'>('contacts');
    
    // 3. Data State
    const [hasUnread, setHasUnread] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const contactsRef = useRef<Contact[]>([]);
    useEffect(() => { contactsRef.current = contacts; }, [contacts]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [phone, setPhone] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);
    const [isSending, setIsSending] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // 4. Draggable State (Berbagi posisi yang sama antara FAB dan Modal)
    const [position, setPosition] = useState({ x: window.innerWidth - 380, y: window.innerHeight - 520 });
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false); // Untuk FAB agar bedakan drag vs click

    // Sesuaikan posisi awal saat pertama kali render di sisi klien
    useEffect(() => {
        setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 }); // Default awal sebagai FAB di pojok kanan
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
        isDragging.current = true;
        hasMoved.current = false;
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        document.body.style.userSelect = 'none';
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
        if (!isDragging.current) return;
        hasMoved.current = true;
        
        // Batas drag: FAB ukuran 56x56, Modal ukuran 380x500. 
        // Ambil aman jangan sampai keluar viewport.
        const width = isExpanded ? 380 : 60;
        const height = isExpanded ? 500 : 60;
        const newX = Math.max(0, Math.min(window.innerWidth - width, e.clientX - dragOffset.current.x));
        const newY = Math.max(0, Math.min(window.innerHeight - height, e.clientY - dragOffset.current.y));
        setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
        isDragging.current = false;
        document.body.style.userSelect = '';
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    // 5. Global Event Listener (Dari Notifikasi Toast atau Action Tabel Servis)
    useEffect(() => {
        const handleOpenChat = (e: any) => {
            const incomingPhone = e.detail?.phone;
            setHasUnread(false);
            
            // Adjust position if it was at FAB default to fit Modal
            if (!isExpanded) {
                setPosition(prev => {
                    const newX = Math.min(prev.x, window.innerWidth - 380);
                    const newY = Math.min(prev.y, window.innerHeight - 500);
                    return { x: newX < 0 ? 10 : newX, y: newY < 0 ? 10 : newY };
                });
            }
            
            setIsExpanded(true);
            
            if (incomingPhone) {
                setPhone(incomingPhone);
                setView('chat');
            } else {
                setView('contacts');
            }
        };
        window.addEventListener('open-global-chat', handleOpenChat as EventListener);
        return () => window.removeEventListener('open-global-chat', handleOpenChat as EventListener);
    }, [isExpanded]);

    // 6. Data Fetching
    const fetchContacts = async () => {
        // Hanya munculkan loader utama jika kontak masih kosong (awal buka)
        // Gunakan contactsRef untuk menghindari stale closure dari WebSocket callback
        if (contactsRef.current.length === 0) {
            setLoadingContacts(true);
        }
        try {
            const res = await fetch(`/api/chats/contacts`);
            const data = await res.json();
            setContacts(data);
            
            // Set unread red dot di FAB jika ada minimal 1 kontak dengan unread_count > 0
            if (data.some((c: Contact) => c.unread_count > 0)) {
                setHasUnread(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingContacts(false);
        }
    };

    useEffect(() => {
        if (isExpanded && view === 'contacts') {
            fetchContacts();
        }
    }, [isExpanded, view]);

    useEffect(() => {
        if (!isExpanded || view !== 'chat' || !phone) return;

        const fetchMessages = async () => {
            setLoadingChat(true);
            try {
                const res = await fetch(`/api/chats/${phone}`);
                const data = await res.json();
                setMessages(data);
                setTimeout(scrollToBottom, 100);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingChat(false);
            }
        };

        fetchMessages();
    }, [isExpanded, view, phone]);

    // 7. WebSocket Listener
    const activeStateRef = useRef({ isExpanded, view, phone });
    useEffect(() => {
        activeStateRef.current = { isExpanded, view, phone };
    }, [isExpanded, view, phone]);

    useEcho('admin.notifications', '.chat.new_message', (e: any) => {
        const { isExpanded: currentExpanded, view: currentView, phone: currentPhoneStr } = activeStateRef.current;
        
        if (!currentExpanded) {
            setHasUnread(true);
            return;
        }

        if (currentView === 'contacts') {
            fetchContacts();
        }

        if (currentView === 'chat' && currentPhoneStr && e.chatLog && e.chatLog.phone) {
            const incomingPhone = e.chatLog.phone.replace(/^(62|0)/, '');
            const currentPhone = currentPhoneStr.replace(/^(62|0)/, '');

            if (incomingPhone === currentPhone) {
                setMessages((prev) => {
                    if (prev.find(m => m.id === e.chatLog.id)) return prev;
                    return [...prev, e.chatLog];
                });
                setTimeout(scrollToBottom, 100);
            }
        }
    });

    // 8. Handle Send Message
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !phone || isSending) return;

        const textToSend = newMessage;
        setNewMessage('');
        setIsSending(true);

        try {
            await fetch(`/api/chats/${phone}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ message: textToSend }),
            });
            
            const res = await fetch(`/api/chats/${phone}`);
            const data = await res.json();
            setMessages(data);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    // ==========================================
    // RENDER FAB (COLLAPSED)
    // ==========================================
    if (!isExpanded) {
        return (
            <Button 
                className="fixed z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 cursor-grab active:cursor-grabbing touch-none transition-transform hover:scale-105"
                style={{ top: position.y, left: position.x }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={() => {
                    if (hasMoved.current) return;
                    setHasUnread(false);
                    // Adjust position for modal to not overflow window right bottom
                    setPosition(prev => {
                        const newX = Math.min(prev.x, window.innerWidth - 380);
                        const newY = Math.min(prev.y, window.innerHeight - 500);
                        return { x: newX < 0 ? 10 : newX, y: newY < 0 ? 10 : newY };
                    });
                    setIsExpanded(true);
                    setView('contacts');
                }}
                title="Pusat Pesan WhatsApp"
            >
                <MessageCircle className="h-7 w-7" />
                {hasUnread && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-red-500" />
                )}
            </Button>
        );
    }

    // ==========================================
    // RENDER MODAL (EXPANDED)
    // ==========================================
    return (
        <div 
            className="fixed z-[9999] flex h-[500px] w-[350px] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl sm:w-[380px]"
            style={{ top: position.y, left: position.x }}
        >
            {/* HEADER - DRAGGABLE */}
            <div 
                className="flex items-center justify-between border-b bg-emerald-600 p-2 text-white cursor-move touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <div className="flex items-center gap-2">
                    {view === 'chat' && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag conflict
                            onClick={(e) => { e.stopPropagation(); setView('contacts'); }} 
                            className="h-7 w-7 text-emerald-50 hover:bg-emerald-700 hover:text-white rounded-full"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <div className="flex flex-col ml-1">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm select-none">
                                {view === 'contacts' ? 'WhatsApp Mini' : 'Live Chat WA'}
                            </h3>
                            <GripHorizontal className="h-3 w-3 text-emerald-300 opacity-70" />
                        </div>
                        {view === 'chat' && <p className="text-[10px] text-emerald-100 font-mono select-none">{phone}</p>}
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag conflict
                    onClick={() => {
                        setIsExpanded(false);
                        // Saat ditutup, reset posisinya kembali memojok (tapi ikuti X Y saat ini)
                        setPosition(prev => {
                            const newX = Math.min(prev.x + 320, window.innerWidth - 80);
                            const newY = Math.min(prev.y + 440, window.innerHeight - 80);
                            return { x: newX, y: newY };
                        });
                    }} 
                    className="h-7 w-7 text-emerald-50 hover:bg-emerald-700 hover:text-white rounded-full"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* BODY - CONTACTS VIEW */}
            {view === 'contacts' && (
                <div className="flex flex-1 flex-col overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar p-2">
                    {loadingContacts ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="animate-spin text-emerald-600 h-6 w-6" />
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="my-auto rounded-lg bg-white p-4 text-center text-sm text-muted-foreground shadow-sm">
                            <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                            Belum ada percakapan.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            {contacts.map((contact, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => { setPhone(contact.phone); setView('chat'); }}
                                    className="flex cursor-pointer items-start gap-3 rounded-lg bg-white p-3 shadow-sm hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <h4 className={`truncate text-sm ${contact.unread_count > 0 ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'font-semibold text-slate-800 dark:text-slate-100'}`}>
                                                {contact.customer_name || contact.phone}
                                            </h4>
                                            <span className={`shrink-0 text-[10px] ${contact.unread_count > 0 ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                                {new Date(contact.last_activity).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className={`truncate text-xs ${contact.unread_count > 0 ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-muted-foreground'}`}>
                                                {contact.last_message}
                                            </p>
                                            {contact.unread_count > 0 && (
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white shadow-sm ml-2 shrink-0">
                                                    {contact.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* BODY - CHAT VIEW */}
            {view === 'chat' && (
                <>
                    <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#e5ddd5] p-4 dark:bg-slate-900 custom-scrollbar">
                        {loadingChat ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="animate-spin text-emerald-600 h-6 w-6" />
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
                        <Input disabled={isSending} placeholder="Ketik pesan..." className="flex-1 bg-background text-sm focus-visible:ring-emerald-500" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <Button disabled={isSending} type="submit" size="icon" className="bg-emerald-600 text-white hover:bg-emerald-700 shrink-0">
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </>
            )}
        </div>
    );
}
