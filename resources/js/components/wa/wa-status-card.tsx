import { Wifi, WifiOff, LogOut } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium">Status Koneksi</span>
                    {waStatus.isConnected ? (
                        <Badge className="bg-green-600">
                            <Wifi className="mr-2 h-3.5 w-3.5" /> Terhubung
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <WifiOff className="mr-2 h-3.5 w-3.5" /> Terputus
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">Nomor Aktif:</p>
                <p className="font-mono text-xl">
                    {waStatus.phoneNumber ?? '-'}
                </p>
            </div>

            {waStatus.isConnected && (
                <Button
                    variant="destructive"
                    size="sm"
                    className="mt-6 w-full"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" /> Putuskan Hubungan
                </Button>
            )}

            <WaAlert
                open={alertConfig.open}
                onOpenChange={(val) =>
                    setAlertConfig((prev) => ({ ...prev, open: val }))
                }
                type={alertConfig.type}
            />
        </div>
    );
}
