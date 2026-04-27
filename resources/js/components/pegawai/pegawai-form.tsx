import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react'; // Untuk efek loading
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PegawaiFormProps {
    pegawai?: any; // Jika ada, berarti mode Edit
    onSuccess?: () => void; // Untuk menutup modal setelah sukses
}

export function PegawaiForm({ pegawai, onSuccess }: PegawaiFormProps) {
    const isEdit = !!pegawai;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: pegawai?.name || '',
        email: pegawai?.email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(route('pegawai.update', pegawai.id), {
                onSuccess: () => onSuccess?.(),
            });
        } else {
            post(route('pegawai.store'), {
                onSuccess: () => {
                    reset();
                    onSuccess?.();
                },
            });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Masukkan nama pegawai..."
                />
                {errors.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="nama@anugerah.com"
                />
                {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                )}
            </div>

            {/* Password hanya wajib diisi saat tambah pegawai baru */}
            {!isEdit && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                        />
                        {errors.password && (
                            <p className="text-xs text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">
                            Konfirmasi Password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                        />
                    </div>
                </>
            )}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={processing}>
                    {processing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEdit ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}
                </Button>
            </div>
        </form>
    );
}
