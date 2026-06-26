import { Wifi } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function WaQrCard({ waStatus }: { waStatus: any }) {
    return (
        <div className="flex flex-col items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-8 shadow-sm dark:border-sidebar-border">
            {!waStatus.isConnected ? (
                <>
                    <div className="mb-4 rounded-lg border bg-white p-4 shadow-sm">
                        {waStatus.qrCode ? (
                            <QRCodeSVG value={waStatus.qrCode} size={200} />
                        ) : (
                            <div className="flex h-[200px] w-[200px] flex-col items-center justify-center gap-2 bg-muted text-xs">
                                <span className="animate-pulse text-lg">⏳</span>
                                Menyiapkan Barcode...
                            </div>
                        )}
                    </div>
                    <p className="text-sm font-semibold">Scan Barcode untuk Menghubungkan</p>
                </>
            ) : (
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <Wifi className="h-10 w-10" />
                    </div>
                    <p className="font-bold text-green-600">Sistem Siap Digunakan</p>
                </div>
            )}
        </div>
    );
}