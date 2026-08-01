import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/dashboard/appearance-tabs';
import Heading from '@/components/ui/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Pengaturan Tampilan" />

            <h1 className="sr-only">Pengaturan Tampilan</h1>

            <div className="space-y-6 max-w-xl">
                <Heading
                    variant="small"
                    title="Pengaturan Tampilan"
                    description="Update tampilan aplikasi sesuai preferensi Anda"
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Tampilan',
            href: editAppearance(),
        },
    ],
};
