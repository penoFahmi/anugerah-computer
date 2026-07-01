import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { PaginatedData } from '@/types/global';

// Mengambil tipe properti yang dibutuhkan langsung dari PaginatedData
type PaginationProps = Pick<
    PaginatedData<any>,
    'links' | 'from' | 'to' | 'total'
>;

export default function Pagination({
    links,
    from,
    to,
    total,
}: PaginationProps) {
    // Sembunyikan pagination jika tidak ada data atau hanya ada 1 halaman (Prev, 1, Next)
    if (!links || links.length <= 3) return null;

    const getRelativeUrl = (absoluteUrl: string | null) => {
        if (!absoluteUrl) return null;
        try {
            const url = new URL(absoluteUrl);
            return url.pathname + url.search;
        } catch {
            return absoluteUrl;
        }
    };

    const parseLabel = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('prev')) return '‹ Sebelumnya';
        if (lowerLabel.includes('next')) return 'Selanjutnya ›';
        return label;
    };

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row">
            <div>
                Menampilkan {from || 0} - {to || 0} dari {total} data
            </div>
            <div className="flex flex-wrap gap-1">
                {links.map((link, idx) => {
                    const relativeUrl = getRelativeUrl(link.url);
                    const labelHtml = parseLabel(link.label);

                    return (
                        <Button
                            key={idx}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            disabled={!relativeUrl}
                            onClick={() =>
                                relativeUrl &&
                                router.get(
                                    relativeUrl,
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                            className={`h-8 px-3 ${link.active ? 'pointer-events-none' : ''}`}
                        >
                            <span
                                dangerouslySetInnerHTML={{ __html: labelHtml }}
                            />
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
