import { Link } from '@inertiajs/react';
import { AlertTriangle, Package, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Sparepart {
    id: number;
    name: string;
    sku: string;
    stock: number;
}

interface LowStockWidgetProps {
    items: Sparepart[];
}

export function LowStockWidget({ items = [] }: LowStockWidgetProps) {
    return (
        <Card className="col-span-full lg:col-span-3 hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-border/40 mb-4 pb-4">
                <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                    </div>
                    Stok Menipis
                </CardTitle>
                <CardDescription>
                    Barang dengan sisa stok fisik 5 atau kurang.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!items || items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                            <Package className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium">Stok sparepart masih aman.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-sm text-foreground">{item.name}</span>
                                    <span className="text-[11px] text-muted-foreground font-mono">{item.sku || 'No SKU'}</span>
                                </div>
                                <Badge variant={item.stock === 0 ? "destructive" : "secondary"} className="font-mono px-2 py-0.5">
                                    {item.stock} Sisa
                                </Badge>
                            </div>
                        ))}

                        <div className="pt-4">
                            <Link href="/inventory/procurement">
                                <Button variant="outline" className="w-full text-xs group">
                                    Lakukan Pengadaan Stok
                                    <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
