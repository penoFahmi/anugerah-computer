import { Head, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

import AppLayout from '@/layouts/app-layout';
import { PosCatalog } from '@/components/sales/pos/pos-catalog';
import { PosCart } from '@/components/sales/pos/pos-cart';
import { ReceiptModal } from '@/components/sales/pos/receipt-modal';
import type { PosPageProps, CartItem, PosProduct, PosSparepart } from '@/types/pos';

export default function PosIndex() {
    const { flash } = usePage().props as any;
    
    // State global untuk halaman POS
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState<number>(0);
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [processing, setProcessing] = useState(false);
    
    // State untuk Receipt
    const [receiptData, setReceiptData] = useState<any>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    // Menangani Flash Message dan Data Invoice
    useEffect(() => {
        if (flash?.invoice_data) {
            setReceiptData(flash.invoice_data);
            setIsReceiptOpen(true);
            // Clear cart upon successful transaction
            setCart([]);
            setDiscount(0);
            setPaidAmount(0);
            setSearchQuery('');
        } else if (flash?.toast) {
            toast[flash.toast.type](flash.toast.message);
        }
    }, [flash]);

    // Keyboard Shortcuts Global
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isReceiptOpen) return; // Nonaktifkan shortcut saat modal struk terbuka
            
            if (e.key === 'F1') {
                e.preventDefault();
                const searchInput = document.getElementById('pos-search-input');
                if (searchInput) searchInput.focus();
            } else if (e.key === 'F2' || e.key === 'F4') {
                e.preventDefault();
                handleCheckout();
            } else if (e.key === 'Escape') {
                // Jangan cegah default jika sedang buka modal dialog lain
                const searchInput = document.getElementById('pos-search-input');
                if (document.activeElement === searchInput) {
                    searchInput.blur();
                    setSearchQuery('');
                } else if (cart.length > 0) {
                    setCart([]);
                    setDiscount(0);
                    setPaidAmount(0);
                    toast.info('Keranjang dikosongkan.');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart.length, isReceiptOpen]);

    // Perhitungan otomatis
    const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
    const finalAmount = Math.max(0, totalAmount - discount);
    const change = Math.max(0, paidAmount - finalAmount);
    const isPaymentValid = paidAmount >= finalAmount && cart.length > 0;

    // State untuk hasil pencarian async
    const [filteredProducts, setFilteredProducts] = useState<PosProduct[]>([]);
    const [filteredSpareparts, setFilteredSpareparts] = useState<PosSparepart[]>([]);

    // Fetch barang secara asinkron berdasarkan searchQuery
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const [prodRes, spareRes] = await Promise.all([
                    axios.get(`/api/products/search?q=${searchQuery}`),
                    axios.get(`/api/spare-parts/search?q=${searchQuery}`)
                ]);
                setFilteredProducts(prodRes.data);
                setFilteredSpareparts(spareRes.data);
            } catch (error) {
                console.error("Gagal memuat barang", error);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchItems();
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

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
            {/* Supaya POS terasa penuh, kita bisa meminimalisir space atau membuat full height */}
            <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] md:h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
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
                
                <ReceiptModal 
                    isOpen={isReceiptOpen}
                    onClose={() => setIsReceiptOpen(false)}
                    invoice={receiptData}
                />
            </div>
        </>
    );
}

PosIndex.layout = (page: React.ReactNode) => {
    // Pada halaman POS, kita bisa menyembunyikan Sidebar secara otomatis
    // Namun karena AppLayout membutuhkan context, kita gunakan style full-bleed di dalam page.
    return (
        <AppLayout breadcrumbs={[{ title: 'Penjualan', href: '#' }, { title: 'Kasir POS', href: '/sales/pos' }]}>
            {page}
        </AppLayout>
    );
};
