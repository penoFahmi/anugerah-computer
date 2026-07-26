import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

export default function StoreSettings({ store }: { store: any }) {
    const { data, setData, post, processing, errors } = useForm({
        store_name: store.store_name || '',
        hero_badge: store.hero_badge || '',
        hero_headline: store.hero_headline || '',
        hero_headline_highlight: store.hero_headline_highlight || '',
        hero_description: store.hero_description || '',
        address: store.address || '',
        phone: store.phone || '',
        whatsapp_url: store.whatsapp_url || '',
        facebook_url: store.facebook_url || '',
        instagram_url: store.instagram_url || '',
        tiktok_url: store.tiktok_url || '',
        youtube_url: store.youtube_url || '',
        open_hours: store.open_hours || '',
        logo: null as File | null,
        new_slider_images: [] as File[],
        existing_slider_images: store.slider_images || [],
        map_embed_url: store.map_embed_url || '',
        services: store.services || [],
        features: store.features || [],
        _method: 'post'
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/settings/store', {
            preserveScroll: true,
            forceFormData: true, // Required for file uploads
            onSuccess: () => toast.success('Pengaturan toko berhasil diperbarui!'),
        });
    };

    const addService = () => {
        setData('services', [...data.services, { id: Date.now(), title: '', description: '', icon: 'Laptop' }]);
    };

    const updateService = (index: number, field: string, value: string) => {
        const newServices = [...data.services];
        newServices[index][field] = value;
        setData('services', newServices);
    };

    const removeService = (index: number) => {
        const newServices = [...data.services];
        newServices.splice(index, 1);
        setData('services', newServices);
    };

    const addFeature = () => {
        setData('features', [...data.features, { id: Date.now(), title: '', description: '', icon: 'CheckCircle' }]);
    };

    const updateFeature = (index: number, field: string, value: string) => {
        const newFeatures = [...data.features];
        newFeatures[index][field] = value;
        setData('features', newFeatures);
    };

    const removeFeature = (index: number) => {
        const newFeatures = [...data.features];
        newFeatures.splice(index, 1);
        setData('features', newFeatures);
    };

    const removeExistingSliderImage = (index: number) => {
        const newImages = [...data.existing_slider_images];
        newImages.splice(index, 1);
        setData('existing_slider_images', newImages);
    };

    return (
        <>
            <Head title="Pengaturan Toko" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pengaturan Landing Page</h1>
                    <p className="text-muted-foreground">Kelola tampilan, teks, dan gambar untuk halaman utama (Landing Page).</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                            <CardDescription>Nama dan teks utama yang muncul di halaman awal.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="store_name">Nama Toko</Label>
                                <Input 
                                    id="store_name" 
                                    value={data.store_name} 
                                    onChange={e => setData('store_name', e.target.value)} 
                                />
                                {errors.store_name && <p className="text-sm text-destructive">{errors.store_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hero_badge">Teks Lencana (Hero Badge)</Label>
                                <Input 
                                    id="hero_badge" 
                                    value={data.hero_badge} 
                                    onChange={e => setData('hero_badge', e.target.value)} 
                                    placeholder="Contoh: Pusat Layanan Terpercaya di Pontianak"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="hero_headline">Judul Slogan (Hero Headline)</Label>
                                    <Input 
                                        id="hero_headline" 
                                        value={data.hero_headline} 
                                        onChange={e => setData('hero_headline', e.target.value)} 
                                        placeholder="Contoh: Solusi Cerdas untuk"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hero_headline_highlight">Teks Judul Disorot (Berwarna)</Label>
                                    <Input 
                                        id="hero_headline_highlight" 
                                        value={data.hero_headline_highlight} 
                                        onChange={e => setData('hero_headline_highlight', e.target.value)} 
                                        placeholder="Contoh: Laptop & Servis"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hero_description">Deskripsi Slogan (Hero Description)</Label>
                                <Textarea 
                                    id="hero_description" 
                                    rows={3}
                                    value={data.hero_description} 
                                    onChange={e => setData('hero_description', e.target.value)} 
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Kontak & Lokasi</CardTitle>
                            <CardDescription>Informasi alamat dan jam buka toko.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <Input id="address" value={data.address} onChange={e => setData('address', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="open_hours">Jam Buka</Label>
                                <Input id="open_hours" value={data.open_hours} onChange={e => setData('open_hours', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp_url">Link WhatsApp (wa.me/...)</Label>
                                <Input id="whatsapp_url" value={data.whatsapp_url} onChange={e => setData('whatsapp_url', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Media Sosial</CardTitle>
                            <CardDescription>Link ke akun sosial media toko Anda yang akan ditampilkan di footer.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="facebook_url">Facebook URL</Label>
                                <Input id="facebook_url" value={data.facebook_url} onChange={e => setData('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instagram_url">Instagram URL</Label>
                                <Input id="instagram_url" value={data.instagram_url} onChange={e => setData('instagram_url', e.target.value)} placeholder="https://instagram.com/..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tiktok_url">TikTok URL</Label>
                                <Input id="tiktok_url" value={data.tiktok_url} onChange={e => setData('tiktok_url', e.target.value)} placeholder="https://tiktok.com/@..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="youtube_url">YouTube URL</Label>
                                <Input id="youtube_url" value={data.youtube_url} onChange={e => setData('youtube_url', e.target.value)} placeholder="https://youtube.com/..." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Google Maps</CardTitle>
                            <CardDescription>Masukkan link embed Google Maps (src iframe) untuk ditampilkan di halaman depan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="map_embed_url">Link Embed Peta (https://www.google.com/maps/embed?...)</Label>
                                <Input 
                                    id="map_embed_url" 
                                    value={data.map_embed_url} 
                                    onChange={e => setData('map_embed_url', e.target.value)} 
                                    placeholder="Tempel link URL dari src iframe di sini..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gambar & Media</CardTitle>
                            <CardDescription>Unggah logo dan gambar slider untuk latar belakang Landing Page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Logo Toko</Label>
                                {store.logo_path && (
                                    <div className="mb-2">
                                        <img src={store.logo_path} alt="Logo" className="h-16 w-auto rounded-lg border object-contain p-1 bg-slate-50" />
                                    </div>
                                )}
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={e => setData('logo', e.target.files?.[0] || null)}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label>Gambar Slider Latar Belakang (Hero Background)</Label>
                                
                                {data.existing_slider_images.length > 0 && (
                                    <div className="flex gap-4 flex-wrap">
                                        {data.existing_slider_images.map((img: string, i: number) => (
                                            <div key={i} className="relative group">
                                                <img src={img} className="h-24 w-40 object-cover rounded-lg border" />
                                                <button 
                                                    type="button"
                                                    onClick={() => removeExistingSliderImage(i)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    multiple
                                    onChange={e => {
                                        if (e.target.files) {
                                            setData('new_slider_images', Array.from(e.target.files));
                                        }
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">Anda bisa memilih lebih dari 1 gambar sekaligus.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Daftar Layanan</CardTitle>
                                    <CardDescription>Layanan yang ditawarkan toko (Service, Tukar Tambah, dll).</CardDescription>
                                </div>
                                <Button type="button" onClick={addService} variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" /> Tambah Layanan
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.services.map((svc: any, index: number) => (
                                <div key={svc.id || index} className="grid gap-4 border p-4 rounded-xl relative bg-slate-50/50">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => removeService(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Judul Layanan</Label>
                                            <Input 
                                                value={svc.title} 
                                                onChange={e => updateService(index, 'title', e.target.value)} 
                                                placeholder="Contoh: Servis Laptop"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nama Ikon (Lucide React)</Label>
                                            <Input 
                                                value={svc.icon} 
                                                onChange={e => updateService(index, 'icon', e.target.value)} 
                                                placeholder="Contoh: Wrench, Laptop, Shield"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Deskripsi</Label>
                                        <Textarea 
                                            rows={2}
                                            value={svc.description} 
                                            onChange={e => updateService(index, 'description', e.target.value)} 
                                        />
                                    </div>
                                </div>
                            ))}
                            {data.services.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">Belum ada layanan yang ditambahkan.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Kenapa Memilih Kami (Keunggulan)</CardTitle>
                                    <CardDescription>Poin-poin keunggulan toko Anda yang ditampilkan di halaman depan.</CardDescription>
                                </div>
                                <Button type="button" onClick={addFeature} variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" /> Tambah Keunggulan
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.features.map((feat: any, index: number) => (
                                <div key={feat.id || index} className="grid gap-4 border p-4 rounded-xl relative bg-slate-50/50">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => removeFeature(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Judul Keunggulan</Label>
                                            <Input 
                                                value={feat.title} 
                                                onChange={e => updateFeature(index, 'title', e.target.value)} 
                                                placeholder="Contoh: Teknisi Berpengalaman"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nama Ikon (Lucide React)</Label>
                                            <Input 
                                                value={feat.icon} 
                                                onChange={e => updateFeature(index, 'icon', e.target.value)} 
                                                placeholder="Contoh: Wrench, Zap, Clock"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Deskripsi</Label>
                                        <Textarea 
                                            rows={2}
                                            value={feat.description} 
                                            onChange={e => updateFeature(index, 'description', e.target.value)} 
                                        />
                                    </div>
                                </div>
                            ))}
                            {data.features.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">Belum ada keunggulan yang ditambahkan.</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing} className="min-w-[150px]">
                            {processing ? 'Menyimpan...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan Pengaturan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

StoreSettings.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pengaturan Toko', href: '/settings/store' }]}>
        {page}
    </AppLayout>
);
