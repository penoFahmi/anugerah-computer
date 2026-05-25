import { Form } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/pegawai';
import type { Pegawai } from '@/types';

interface Props {
    pegawai?: Pegawai | null;
    onSuccess?: () => void;
}

export function PegawaiForm({ pegawai, onSuccess }: Props) {
    const isEdit = !!pegawai;

    return (
        <>
            {/* Mengatasi warning Accessibility "Missing Description" dari Radix UI */}
            <DialogDescription className="sr-only">
                {isEdit ? 'Formulir edit data pegawai.' : 'Formulir tambah pegawai baru.'}
            </DialogDescription>

            <Form
                {...(isEdit ? update.form(pegawai.id) : store.form())}
                className="space-y-4 py-4"
                onSuccess={() => onSuccess?.()}
            >
                {/* HANYA ambil errors dan processing.
                    Kita TIDAK memakai data/setData karena Inertia v3 otomatis 
                    mengumpulkan data berdasarkan atribut 'name' pada Input!
                */}
                {({ errors, processing }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input 
                                id="name" 
                                name="name" 
                                defaultValue={pegawai?.name ?? ''} 
                                required 
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                defaultValue={pegawai?.email ?? ''} 
                                required 
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone_number">No. Telepon</Label>
                            <Input 
                                id="phone_number" 
                                name="phone_number" 
                                type="tel"
                                defaultValue={pegawai?.phone_number ?? ''} 
                            />
                            <InputError message={errors.phone_number} />
                        </div>

                        {!isEdit && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input 
                                        id="password" 
                                        name="password" 
                                        type="password" 
                                        required 
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi</Label>
                                    <Input 
                                        id="password_confirmation" 
                                        name="password_confirmation" 
                                        type="password" 
                                        required 
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}