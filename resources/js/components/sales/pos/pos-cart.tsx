import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
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

    return (
        <div className="w-full lg:w-2/5 flex flex-col bg-background h-full shadow-xl z-10 border-l">
            <div className="p-4 border-b bg-blue-600 text-white flex items-center justify-between">
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" /> Keranjang Belanja
                </h2>
                <span className="bg-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{cart.length} Item</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/20">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                        <ShoppingCart className="h-16 w-16 mb-4" />
                        <p>Keranjang masih kosong</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={`${item.type}-${item.id}`} className="bg-card border rounded-lg p-3 flex justify-between items-center shadow-sm">
                            <div className="flex-1 pr-2">
                                <h4 className="font-semibold text-sm leading-tight line-clamp-2">{item.name}</h4>
                                <p className="font-mono text-sm text-blue-600 mt-1">{formatRupiah(item.price)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Button variant="ghost" size="sm" className="h-6 w-6 text-red-500 hover:text-red-700 p-0" onClick={() => removeFromCart(item.id, item.type)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-2 bg-muted rounded-md border">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.type, -1)} disabled={item.quantity <= 1}>
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.type, 1)} disabled={item.quantity >= item.maxStock}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="border-t bg-card p-5 space-y-4">
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatRupiah(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Diskon (Rp)</span>
                        <Input 
                            className="w-32 h-8 text-right font-mono" 
                            value={discount === 0 ? '' : new Intl.NumberFormat('id-ID').format(discount)} 
                            onChange={(e) => {
                                const clean = e.target.value.replace(/\D/g, '');
                                setDiscount(Number(clean));
                            }}
                            placeholder="0"
                        />
                    </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total Akhir</span>
                    <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">{formatRupiah(finalAmount)}</span>
                </div>

                <div className="pt-2">
                    <Label className="text-muted-foreground mb-1 block">Uang Pelanggan (Rp)</Label>
                    <Input 
                        className="h-12 text-2xl font-mono font-bold text-right bg-muted/50" 
                        value={paidAmount === 0 ? '' : new Intl.NumberFormat('id-ID').format(paidAmount)} 
                        onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, '');
                            setPaidAmount(Number(clean));
                        }}
                        placeholder="0"
                    />
                </div>

                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Kembalian</span>
                    <span className={change > 0 ? "text-emerald-600" : "text-muted-foreground"}>{formatRupiah(change)}</span>
                </div>

                <Button 
                    className="w-full h-14 text-lg font-bold mt-2" 
                    disabled={!isPaymentValid || processing}
                    onClick={handleCheckout}
                >
                    {processing ? 'Memproses...' : (
                        <><CreditCard className="mr-2 h-6 w-6" /> BAYAR SEKARANG</>
                    )}
                </Button>
            </div>
        </div>
    );
}