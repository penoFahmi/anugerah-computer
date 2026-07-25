import { Wifi, WifiOff, LogOut, Smartphone, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WaAlert } from './wa-alert';

export function WaStatusCard({ waStatus }: { waStatus: any }) {
    const [alertConfig, setAlertConfig] = useState<{
        open: boolean;
        type: 'logout' | null;
    }>({
        open: false,
        type: null,
    });

    const handleLogout = () => {
        setAlertConfig({ open: true, type: 'logout' });
    };

    return (
        <Card className="flex flex-col justify-between h-full">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-emerald-500" />
                        Status Koneksi
                    </CardTitle>
                    {waStatus.isConnected ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 px-2 py-0.5 shadow-sm">
                            <Wifi className="mr-1.5 h-3.5 w-3.5" /> Terhubung
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="px-2 py-0.5 shadow-sm">
                            <WifiOff className="mr-1.5 h-3.5 w-3.5" /> Terputus
                        </Badge>
                    )}
                </div>
                <CardDescription>
                    Koneksi antara ERP System dengan API WhatsApp Gateway.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Nomor HP Aktif
                    </p>
                    <p className="font-mono text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        {waStatus.phoneNumber ? `+${waStatus.phoneNumber}` : 'Tidak Ada'}
                    </p>
                    
                    {waStatus.isConnected && (
                        <div className="mt-3 flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Sistem Siap Digunakan
                        </div>
                    )}
                </div>
            </CardContent>

            {waStatus.isConnected && (
                <CardFooter className="mt-auto pb-6">
                    <Button
                        variant="destructive"
                        className="w-full shadow-sm"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" /> Putuskan Sesi WhatsApp
                    </Button>
                </CardFooter>
            )}

            <WaAlert
                open={alertConfig.open}
                onOpenChange={(val) =>
                    setAlertConfig((prev) => ({ ...prev, open: val }))
                }
                type={alertConfig.type}
            />
        </Card>
    );
}
