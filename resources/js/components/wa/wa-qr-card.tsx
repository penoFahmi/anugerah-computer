import { Wifi, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function WaQrCard({ waStatus }: { waStatus: any }) {
    return (
        <Card className="flex flex-col justify-between h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-slate-500" />
                    Tautkan Perangkat
                </CardTitle>
                <CardDescription>
                    Pindai QR Code di bawah menggunakan WhatsApp di HP Anda.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center p-6">
                {!waStatus.isConnected ? (
                    <>
                        <div className="mb-6 rounded-xl border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700">
                            {waStatus.qrCode ? (
                                <QRCodeSVG value={waStatus.qrCode} size={220} />
                            ) : (
                                <div className="flex h-[220px] w-[220px] flex-col items-center justify-center gap-3 bg-slate-50 text-xs text-slate-500 dark:bg-slate-800/50">
                                    <span className="animate-pulse text-2xl">⏳</span>
                                    <span>Menyiapkan Barcode...</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                            Siapkan WhatsApp di HP Anda &rarr; Pilih Perangkat Taut
                        </p>
                    </>
                ) : (
                    <div className="text-center animate-in fade-in zoom-in duration-500">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner dark:bg-emerald-900/30 dark:text-emerald-400">
                            <Wifi className="h-12 w-12" />
                        </div>
                        <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">WhatsApp Tersambung!</p>
                        <p className="text-sm text-muted-foreground mt-2">Bot AI dan Notifikasi siap mengirim pesan.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
