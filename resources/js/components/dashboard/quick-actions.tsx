import { Link } from '@inertiajs/react';
import { PlusCircle, ShoppingCart, Wallet } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function QuickActions() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/services" className="col-span-1">
                <Button variant="outline" className="w-full h-12 justify-start px-4 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 group">
                    <PlusCircle className="mr-2 h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm">Buat Servis</span>
                </Button>
            </Link>
            <Link href="/sales/pos" className="col-span-1">
                <Button variant="outline" className="w-full h-12 justify-start px-4 border-dashed border-2 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group">
                    <ShoppingCart className="mr-2 h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm">Kasir (POS)</span>
                </Button>
            </Link>
            <Link href="/finance/cashflow" className="col-span-1">
                <Button variant="outline" className="w-full h-12 justify-start px-4 border-dashed border-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 group">
                    <Wallet className="mr-2 h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm">Catat Pengeluaran</span>
                </Button>
            </Link>
        </div>
    );
}
