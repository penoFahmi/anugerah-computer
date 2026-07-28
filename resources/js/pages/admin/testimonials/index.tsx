import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function TestimonialIndex({ testimonials }: { testimonials: any[] }) {
    
    const updateStatus = (id: number, status: string) => {
        router.patch(`/testimonials/${id}/status`, { status }, {
            preserveScroll: true,
        });
    };

    const deleteTesti = (id: number) => {
        if (confirm('Yakin ingin menghapus testimoni ini?')) {
            router.delete(`/testimonials/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Manajemen Testimoni" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manajemen Testimoni</h1>
                    <p className="text-muted-foreground">Pilih testimoni pelanggan yang ingin ditampilkan di halaman depan.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testi: any) => (
                        <Card key={testi.id} className="flex flex-col">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{testi.name}</CardTitle>
                                    <Badge variant={testi.status === 'approved' ? 'default' : testi.status === 'rejected' ? 'destructive' : 'secondary'}>
                                        {testi.status}
                                    </Badge>
                                </div>
                                <CardDescription>{testi.role || 'Pelanggan'}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex gap-1 text-amber-400 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < testi.rating ? 'fill-current' : 'text-slate-300'}`} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-600 mb-6 italic">"{testi.text}"</p>
                                </div>
                                
                                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-auto">
                                    {testi.status !== 'approved' && (
                                        <Button variant="outline" size="sm" onClick={() => updateStatus(testi.id, 'approved')} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                            <CheckCircle2 className="h-4 w-4 mr-1" /> Terima
                                        </Button>
                                    )}
                                    {testi.status !== 'rejected' && (
                                        <Button variant="outline" size="sm" onClick={() => updateStatus(testi.id, 'rejected')} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <XCircle className="h-4 w-4 mr-1" /> Tolak
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => deleteTesti(testi.id)} className="text-slate-500 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {testimonials.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                            Belum ada ulasan dari pengunjung.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
