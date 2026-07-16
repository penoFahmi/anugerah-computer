import { Head, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { PosCatalog } from '@/components/sales/pos/pos-catalog';
import { PosCart } from '@/components/sales/pos/pos-cart';
import type { PosPageProps, CartItem, PosProduct, PosSparepart } from '@/types/pos';

export default function PosIndex({ products, spareparts }: PosPageProps) {
    const { flash } = usePage().props as any;
    
    // State global untuk halaman POS
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState<number>(0);
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [processing, setProcessing] = useState(false);

    // Menangani Flash Message
    useEffect(() => {
        if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
            if (flash.toast.type === 'success') {
                setCart([]);
                setDiscount(0);
                setPaidAmount(0);
                setSearchQuery('');
            }
        }
    }, [flash]);

    // Perhitungan otomatis
    const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
    const finalAmount = Math.max(0, totalAmount - discount);
    const change = Math.max(0, paidAmount - finalAmount);
    const isPaymentValid = paidAmount >= finalAmount && cart.length > 0;

    // Filter barang berdasarkan pencarian
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredSpareparts = spareparts.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Fungsi Keranjang
    const addToCart = (item: PosProduct | PosSparepart) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id && i.type === item.type);
            
            if (item.type === 'product') {
                if (existing) {
                    toast.info('Laptop ini sudah ada di keranjang.');
                    return prev;
                }
                return [...prev, { id: item.id, type: 'product', name: item.name, price: Number(item.selling_price), quantity: 1, maxStock: 1 }];
            }
            
            if (item.type === 'sparepart') {
                if (existing) {
                    if (existing.quantity >= item.stock) {
                        toast.error('Gagal: Stok tidak mencukupi.');
                        return prev;
                    }
                    return prev.map(i => i.id === item.id && i.type === 'sparepart' ? { ...i, quantity: i.quantity + 1 } : i);
                }
                return [...prev, { id: item.id, type: 'sparepart', name: item.name, price: Number(item.selling_price), quantity: 1, maxStock: item.stock }];
            }
            return prev;
        });
    };

    const updateQuantity = (id: number, type: 'product' | 'sparepart', delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id && item.type === type) {
                const newQty = item.quantity + delta;
                if (newQty > 0 && newQty <= item.maxStock) {
                    return { ...item, quantity: newQty };
                }
            }
            return item;
        }));
    };

    const removeFromCart = (id: number, type: 'product' | 'sparepart') => {
        setCart(prev => prev.filter(item => !(item.id === id && item.type === type)));
    };

    const handleCheckout = () => {
        if (!isPaymentValid) return;
        
        setProcessing(true);
        router.post('/sales/pos', {
            cart_items: cart,
            total_amount: totalAmount,
            discount: discount,
            final_amount: finalAmount,
            paid_amount: paidAmount,
            payment_method: 'cash',
        }, {
            preserveState: true,
            onFinish: () => setProcessing(false)
        });
    };

    return (
        <>
            <Head title="Mesin Kasir (POS)" />
            <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 dark:bg-slate-950">
                <PosCatalog 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredProducts={filteredProducts}
                    filteredSpareparts={filteredSpareparts}
                    addToCart={addToCart}
                />
                
                <PosCart 
                    cart={cart}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    totalAmount={totalAmount}
                    discount={discount}
                    setDiscount={setDiscount}
                    finalAmount={finalAmount}
                    paidAmount={paidAmount}
                    setPaidAmount={setPaidAmount}
                    change={change}
                    isPaymentValid={isPaymentValid}
                    handleCheckout={handleCheckout}
                    processing={processing}
                />
            </div>
        </>
    );
}

PosIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Penjualan', href: '#' }, { title: 'Kasir POS', href: '/sales/pos' }]}>
        {page}
    </AppLayout>
);