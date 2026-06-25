import { Plus } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';

interface ServicePageHeaderProps {
    title: string;
    description: string;
    onAcceptService: () => void;
}

export function ServicePageHeader({ title, description, onAcceptService }: ServicePageHeaderProps) {
    return (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <Heading title={title} description={description} />
            <Button
                className="bg-primary font-semibold shadow-md hover:bg-primary/90"
                onClick={onAcceptService}
            >
                <Plus className="mr-2 h-4 w-4" /> Terima Servisan
            </Button>
        </div>
    );
}