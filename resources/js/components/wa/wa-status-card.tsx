import { router } from '@inertiajs/react';
import { Wifi, WifiOff, LogOut } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes/config/wa';

export function WaStatusCard({ waStatus }: { waStatus: any }) {
    const handleLogout = () => {
        if (confirm('Putuskan koneksi WhatsApp? Sistem akan otomatis membuat QR Code baru.')) {
            router.post(logout.url());
        }
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
                <p className="font-mono text-xl">{waStatus.phoneNumber ?? '-'}</p>
            </div>

            {waStatus.isConnected && (
                <Button variant="destructive" size="sm" className="mt-6 w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Putuskan Hubungan
                </Button>
            )}
        </div>
    );
}