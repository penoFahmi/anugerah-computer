import { Form } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react'; 
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    store,
    update,
} from '@/routes/services';
import type { ServiceOrder } from '@/types';

interface Props {
    service?: ServiceOrder | null;
    onSuccess?: () => void;
}

export function ServiceForm({ service, onSuccess }: Props) {
    const isEdit = !!service;

    // STATE REACT BIASA UNTUK MENGONTROL MUNCUL/HILANGNYA FORM
    const [isTechnicianOnSite, setIsTechnicianOnSite] = useState(
        service?.is_technician_on_site ?? false,
    );
    const [decision, setDecision] = useState('waiting');

    return (
        <>
            <DialogDescription className="sr-only">
                Form input tiket servis
            </DialogDescription>
            <Form
                {...(isEdit ? update.form(service.id) : store.form())}
                onSuccess={() => onSuccess?.()}
                className="space-y-4 py-4"
            >
                {/* HANYA ambil errors dan processing (PERSIS SEPERTI POLA PRODUCT KITA).
                  Data akan ditangkap otomatis oleh Inertia lewat atribut "name" pada tiap Input.
                */}
                {({ errors, processing }) => (
                    <>
                        {/* Hidden input untuk mengirim state UI ke backend */}
                        <input
                            type="hidden"
                            name="is_technician_on_site"
                            value={isTechnicianOnSite ? '1' : '0'}
                        />
                        <input
                            type="hidden"
                            name="direct_decision"
                            value={decision}
                        />

                        {/* --- 1. DATA PELANGGAN & UNIT --- */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="customer_name">
                                    Nama Pelanggan
                                </Label>
                                <Input
                                    id="customer_name"
                                    name="customer_name"
                                    defaultValue={service?.customer?.name ?? ''}
                                    required
                                />
                                <InputError message={errors.customer_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="customer_phone">
                                    No. WhatsApp
                                </Label>
                                <Input
                                    id="customer_phone"
                                    name="customer_phone"
                                    defaultValue={
                                        service?.customer?.phone ?? ''
                                    }
                                    placeholder="08..."
                                    required
                                />
                                <InputError message={errors.customer_phone} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="brand">Merek Unit</Label>
                                <Input
                                    id="brand"
                                    name="brand"
                                    defaultValue={service?.device?.brand ?? ''}
                                    required
                                />
                                <InputError message={errors.brand} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="model">Tipe/Model</Label>
                                <Input
                                    id="model"
                                    name="model"
                                    defaultValue={service?.device?.model ?? ''}
                                    required
                                />
                                <InputError message={errors.model} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="complaint">Keluhan Pelanggan</Label>
                            <Textarea
                                id="complaint"
                                name="complaint"
                                defaultValue={service?.complaint ?? ''}
                                required
                            />
                            <InputError message={errors.complaint} />
                        </div>

                        {/* --- 2. SWITCH KONDISI TEKNISI --- */}
                        {!isEdit && (
                            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                                <div className="space-y-0.5">
                                    <Label>Teknisi Ada di Tempat?</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Aktifkan jika teknisi bisa langsung
                                        mengecek & menetapkan biaya.
                                    </p>
                                </div>
                                <Switch
                                    checked={isTechnicianOnSite}
                                    onCheckedChange={setIsTechnicianOnSite} // Mengubah state React, bukan data Inertia!
                                />
                            </div>
                        )}

                        {/* --- 3. MUNCUL DINAMIS JIKA TEKNISI ADA DI TEMPAT --- */}
                        {isTechnicianOnSite && (
                            <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-900/10">
                                <div className="grid gap-2">
                                    <Label htmlFor="estimated_cost">
                                        Estimasi Biaya (Rp)
                                    </Label>
                                    <Input
                                        id="estimated_cost"
                                        name="estimated_cost"
                                        type="number"
                                        defaultValue={
                                            service?.estimated_cost ?? ''
                                        }
                                        placeholder="Contoh: 350000"
                                        required={isTechnicianOnSite}
                                    />
                                    <InputError
                                        message={errors.estimated_cost}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="technician_notes">
                                        Rincian / Catatan Teknisi
                                    </Label>
                                    <Textarea
                                        id="technician_notes"
                                        name="technician_notes"
                                        defaultValue={
                                            service?.technician_notes ?? ''
                                        }
                                        placeholder="Contoh: Ganti LCD dan pembersihan..."
                                    />
                                    <InputError
                                        message={errors.technician_notes}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Keputusan Pelanggan Saat Ini</Label>
                                    <Select
                                        value={decision}
                                        onValueChange={setDecision}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Keputusan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="waiting">
                                                Pikir-pikir dulu (Tunda)
                                            </SelectItem>
                                            <SelectItem value="approved">
                                                Langsung Setuju (Kerjakan)
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                Batal Servis
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {decision !== 'waiting' && (
                                        <p className="mt-1 text-xs font-medium text-emerald-600">
                                            *Sistem otomatis membuat Nota dan
                                            mengirim WhatsApp Konfirmasi setelah
                                            disimpan.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- TOMBOL SIMPAN --- */}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onSuccess?.()}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Simpan &{' '}
                                {isTechnicianOnSite && decision !== 'waiting'
                                    ? 'Kirim Nota WA'
                                    : 'Buat Tiket'}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
