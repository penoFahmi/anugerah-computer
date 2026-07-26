import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { CartItem } from '@/types/pos';

interface Props {
    cart: CartItem[];
    updateQuantity: (id: number, type: 'product' | 'sparepart', delta: number) => void;
    removeFromCart: (id: number, type: 'product' | 'sparepart') => void;
    totalAmount: number;
    discount: number;
    setDiscount: (val: number) => void;
    finalAmount: number;
    paidAmount: number;
    setPaidAmount: (val: number) => void;
    change: number;
    isPaymentValid: boolean;
    handleCheckout: () => void;
    processing: boolean;
}

export function PosCart({ 
    cart, updateQuantity, removeFromCart, totalAmount, discount, 
    setDiscount, finalAmount, paidAmount, setPaidAmount, change, 
    isPaymentValid, handleCheckout, processing 
}: Props) {

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    const handleQuickCash = (amount: number) => {
        setPaidAmount(amount);
    };

    return (
        <div className="w-full lg:w-[35%] flex flex-col bg-white dark:bg-slate-950 h-full shadow-2xl z-20 border-l border-slate-200 dark:border-slate-800 relative">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between h-14">
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-400" /> Keranjang Belanja
                </h2>
                <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide">{cart.length} ITEM</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50 dark:bg-slate-900/20">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                        <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
                        <p className="font-medium text-slate-500">Keranjang masih kosong</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={`${item.type}-${item.id}`} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex justify-between items-center shadow-sm">
                            <div className="flex-1 pr-3">
                                <h4 className="font-bold text-[14px] leading-tight line-clamp-2 text-slate-800 dark:text-slate-200">{item.name}</h4>
                                <p className="font-bold text-[13px] text-blue-600 dark:text-blue-400 mt-1">{formatRupiah(item.price)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <Button variant="ghost" size="sm" className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-0" onClick={() => removeFromCart(item.id, item.type)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white dark:hover:bg-slate-800 shadow-sm" onClick={() => updateQuantity(item.id, item.type, -1)} disabled={item.quantity <= 1}>
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white dark:hover:bg-slate-800 shadow-sm" onClick={() => updateQuantity(item.id, item.type, 1)} disabled={item.quantity >= item.maxStock}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="space-y-2 text-sm font-medium">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span className="text-slate-800 dark:text-slate-200">{formatRupiah(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span>Diskon (Rp)</span>
                        <Input 
                            className="w-32 h-8 text-right font-mono bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" 
                            value={discount === 0 ? '' : new Intl.NumberFormat('id-ID').format(discount)} 
                            onChange={(e) => {
                                const clean = e.target.value.replace(/\D/g, '');
                                setDiscount(Number(clean));
                            }}
                            placeholder="0"
                        />
                    </div>
                </div>
                
                <Separator className="bg-slate-200 dark:bg-slate-800" />
                
                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-slate-700 dark:text-slate-300">Total Akhir</span>
                    <span className="font-black text-3xl tracking-tight text-blue-700 dark:text-blue-400">{formatRupiah(finalAmount)}</span>
                </div>

                <div className="pt-3">
                    <div className="flex justify-between items-end mb-2">
                        <Label className="font-bold text-slate-700 dark:text-slate-300">Nominal Bayar</Label>
                        <div className="flex gap-1.5">
                            <Button type="button" variant="outline" size="sm" className="h-7 text-xs font-semibold px-2 border-slate-200 dark:border-slate-700" onClick={() => handleQuickCash(finalAmount)}>
                                UANG PAS
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="h-7 text-xs font-semibold px-2 border-slate-200 dark:border-slate-700" onClick={() => handleQuickCash(50000)}>
                                50K
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="h-7 text-xs font-semibold px-2 border-slate-200 dark:border-slate-700" onClick={() => handleQuickCash(100000)}>
                                100K
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <Banknote className="absolute left-3 top-3.5 h-6 w-6 text-slate-400" />
                        <Input 
                            className="h-14 pl-12 text-2xl font-mono font-bold text-right bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 rounded-xl" 
                            value={paidAmount === 0 ? '' : new Intl.NumberFormat('id-ID').format(paidAmount)} 
                            onChange={(e) => {
                                const clean = e.target.value.replace(/\D/g, '');
                                setPaidAmount(Number(clean));
                            }}
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center text-lg font-bold pt-1">
                    <span className="text-slate-600 dark:text-slate-400">Kembalian</span>
                    <span className={change > 0 ? "text-emerald-600 dark:text-emerald-400 text-2xl font-black" : "text-slate-400 text-xl font-bold"}>{formatRupiah(change)}</span>
                </div>

                <Button 
                    className="w-full h-16 text-lg font-bold rounded-xl shadow-lg mt-2 transition-all" 
                    disabled={!isPaymentValid || processing}
                    onClick={handleCheckout}
                    size="lg"
                >
                    {processing ? 'Memproses...' : (
                        <><CreditCard className="mr-2 h-6 w-6" /> BAYAR (F2)</>
                    )}
                </Button>
            </div>
        </div>
    );
}
