import { Link } from '@inertiajs/react';
import { PlusCircle, ShoppingCart, Wallet, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function QuickActions() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/services" className="col-span-1 block group outline-none">
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-5 transition-colors group-hover:border-blue-300 dark:group-hover:border-blue-700"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-blue-500 rounded-lg text-white shadow-sm">
                                <PlusCircle className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-blue-900 dark:text-blue-100">Buat Servis Baru</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors group-hover:translate-x-1 duration-300" />
                    </div>
                </motion.div>
            </Link>

            <Link href="/sales/pos" className="col-span-1 block group outline-none">
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-5 transition-colors group-hover:border-emerald-300 dark:group-hover:border-emerald-700"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-emerald-500 rounded-lg text-white shadow-sm">
                                <ShoppingCart className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-emerald-900 dark:text-emerald-100">Buka Kasir (POS)</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors group-hover:translate-x-1 duration-300" />
                    </div>
                </motion.div>
            </Link>

            <Link href="/finance/cashflow" className="col-span-1 block group outline-none">
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 p-5 transition-colors group-hover:border-rose-300 dark:group-hover:border-rose-700"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-rose-500 rounded-lg text-white shadow-sm">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-rose-900 dark:text-rose-100">Catat Pengeluaran</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-rose-400 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors group-hover:translate-x-1 duration-300" />
                    </div>
                </motion.div>
            </Link>
        </div>
    );
}
