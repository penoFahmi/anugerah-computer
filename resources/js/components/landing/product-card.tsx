import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LandingProduct } from '@/types/landing';

export function ProductCard({ laptop }: { laptop: LandingProduct }) {
    return (
        <Card className="flex flex-col justify-between overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-xl leading-tight">{laptop.name}</CardTitle>
                    {laptop.status === 'ready' ? (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">
                            Ready
                        </span>
                    ) : (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-500/20 ring-inset">
                            {laptop.status}
                        </span>
                    )}
                </div>
                <CardDescription className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {laptop.specs}
                </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-slate-900">{laptop.price}</span>
                <Button 
                    disabled={laptop.status !== 'ready'} 
                    size="sm" 
                    className={laptop.status === 'ready' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                    {laptop.status === 'ready' ? 'Beli Sekarang' : 'Habis'}
                </Button>
            </CardFooter>
        </Card>
    );
}
