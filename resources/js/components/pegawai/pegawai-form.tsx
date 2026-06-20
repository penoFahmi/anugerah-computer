import { useForm, usePage } from '@inertiajs/react';
import { Loader2, Info } from 'lucide-react';
import { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Pegawai, Role, PegawaiPageProps } from '@/types/pegawai';

interface Props {
    pegawai?: Pegawai | null;
    onSuccess?: () => void;
}

export function PegawaiForm({ pegawai, onSuccess }: Props) {
    const isEdit = !!pegawai;
    const { roles } = usePage<PegawaiPageProps>().props;

    // Menggunakan standar hook useForm Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: pegawai?.name ?? '',
        email: pegawai?.email ?? '',
        phone_number: pegawai?.phone_number ?? '',
        role: pegawai?.role ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        clearErrors();

        if (isEdit) {
            put(`/pegawai/${pegawai.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onSuccess?.();
                },
            });
        } else {
            post('/pegawai', {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onSuccess?.();
                },
            });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap <span className="text-destructive">*</span></Label>
                <Input 
                    id="name" 
                    value={data.name} 
                    onChange={(e) => setData('name', e.target.value)} 
                    placeholder="Contoh: Budi Santoso"
                    disabled={processing}
                    required 
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Alamat Email <span className="text-destructive">*</span></Label>
                <Input 
                    id="email" 
                    type="email" 
                    value={data.email} 
                    onChange={(e) => setData('email', e.target.value)} 
                    placeholder="budi@anugerah.com"
                    disabled={processing}
                    required 
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="phone_number">Nomor WhatsApp</Label>
                <Input 
                    id="phone_number" 
                    type="tel" 
                    value={data.phone_number} 
                    onChange={(e) => setData('phone_number', e.target.value)} 
                    placeholder="081234567890"
                    disabled={processing}
                />
                <InputError message={errors.phone_number} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="role">Peran (Role) <span className="text-destructive">*</span></Label>
                <Select 
                    value={data.role} 
                    onValueChange={(value) => setData('role', value)}
                    disabled={processing}
                    required
                >
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Pilih hak akses..." />
                    </SelectTrigger>
                    <SelectContent>
                        {roles?.map((r: Role) => (
                            <SelectItem key={r.id} value={r.name} className="capitalize">
                                {r.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.role} />
            </div>

            {/* UX Indicator: Informasikan password default kepada admin agar tidak bingung */}
            {!isEdit && (
                <Alert className="bg-blue-50 text-blue-800 border-blue-200 shadow-sm mt-4 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-xs ml-2 font-medium">
                        Untuk keamanan, password akun baru akan di-set otomatis menjadi: <span className="font-bold underline decoration-blue-400">password</span>. Pegawai dapat menggantinya nanti.
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex justify-end pt-5 gap-3">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                        reset();
                        clearErrors();
                        onSuccess?.();
                    }}
                    disabled={processing}
                >
                    Batal
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}
                </Button>
            </div>
        </form>
    );
}