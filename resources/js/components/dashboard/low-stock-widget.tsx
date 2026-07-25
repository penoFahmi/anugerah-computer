import { Link } from '@inertiajs/react';
import { AlertTriangle, Package } from 'lucide-react';
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
        <Card className="col-span-full lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Stok Sparepart Menipis
                </CardTitle>
                <CardDescription>
                    Barang dengan stok fisik 5 atau kurang. Segera lakukan pengadaan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!items || items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                        <Package className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm font-medium">Stok sparepart masih aman.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm text-foreground">{item.name}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{item.sku || 'No SKU'}</span>
                                </div>
                                <Badge variant={item.stock === 0 ? "destructive" : "secondary"} className="font-mono px-2 py-0.5">
                                    {item.stock} Sisa
                                </Badge>
                            </div>
                        ))}

                        <div className="pt-2">
                            <Link href="/inventory/procurement">
                                <Button variant="outline" className="w-full text-xs">
                                    Lakukan Pengadaan Stok
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
