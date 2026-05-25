import { Head, router, usePoll } from '@inertiajs/react';
import { RefreshCcw, Wifi, WifiOff, LogOut } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { logout } from '@/routes/config/wa';

export default function ConfigWa({ waStatus }: { waStatus: any }) {
    
    // KEAJAIBAN INERTIA V3: Refresh otomatis data dari server setiap 3 detik
    usePoll(3000, {
        only: ['waStatus'],
        keepAlive: true,
    });

    const handleLogout = () => {
        if (confirm('Putuskan koneksi WhatsApp? Sistem akan otomatis membuat QR Code baru.')) {
            router.post(logout.url());
        }
    };

    return (
        <>
            <Head title="WhatsApp Gateway" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">WhatsApp Gateway</h2>
                        <p className="text-muted-foreground">Status koneksi server Node.js Baileys.</p>
                    </div>
                    <Button variant="outline" onClick={() => router.reload({ only: ['waStatus'] })}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border p-6 bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-medium">Status Koneksi</span>
                            {waStatus.isConnected ? (
                                <Badge className="bg-green-600"><Wifi className="mr-2 h-3.5 w-3.5" /> Terhubung</Badge>
                            ) : (
                                <Badge variant="destructive"><WifiOff className="mr-2 h-3.5 w-3.5" /> Terputus</Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">Nomor Aktif:</p>
                        <p className="text-xl font-mono">{waStatus.phoneNumber ?? '-'}</p>
                        
                        {waStatus.isConnected && (
                            <Button variant="destructive" size="sm" className="mt-6 w-full" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" /> Putuskan Hubungan
                            </Button>
                        )}
                    </div>

                    <div className="rounded-xl border p-8 bg-card flex flex-col items-center justify-center">
                        {!waStatus.isConnected ? (
                            <>
                                <div className="p-4 bg-white rounded-lg border shadow-sm mb-4">
                                    {waStatus.qrCode ? (
                                        <QRCodeSVG value={waStatus.qrCode} size={200} />
                                    ) : (
                                        <div className="h-[200px] w-[200px] flex items-center justify-center bg-muted text-xs flex-col gap-2">
                                            <span className="animate-pulse text-lg">⏳</span>
                                            Menyiapkan Barcode...
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-semibold">Scan Barcode untuk Menghubungkan</p>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Wifi className="h-10 w-10" />
                                </div>
                                <p className="font-bold text-green-600">Sistem Siap Digunakan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

ConfigWa.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Settings', href: '#' }, { title: 'WA Gateway', href: '/config/wa' }]}>
        {page}
    </AppLayout>
);