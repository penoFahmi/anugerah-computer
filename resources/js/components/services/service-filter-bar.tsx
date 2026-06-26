import { Search, FilterX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface FilterState {
    search: string;
    status: string;
    per_page: string;
}

interface ServiceFilterBarProps {
    filterState: FilterState;
    setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
    handleSearchDebounce: (value: string) => void;
    onPerPageChange: (value: string) => void;
    onReset: () => void;
}

export function ServiceFilterBar({
    filterState,
    setFilterState,
    handleSearchDebounce,
    onPerPageChange,
    onReset,
}: ServiceFilterBarProps) {
    return (
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row">
            {/* Input Kotak Pencarian */}
            <div className="relative w-full sm:w-64">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Cari nota, nama, WA..."
                    className="pl-8 bg-background"
                    value={filterState.search}
                    onChange={(e) => {
                        setFilterState((prev) => ({
                            ...prev,
                            search: e.target.value,
                        }));
                        handleSearchDebounce(e.target.value);
                    }}
                />
            </div>

            {/* Pilihan Jumlah Baris Tabel */}
            <Select value={filterState.per_page} onValueChange={onPerPageChange}>
                <SelectTrigger className="w-full sm:w-[120px] bg-background">
                    <SelectValue placeholder="Baris" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="5">5 Baris</SelectItem>
                    <SelectItem value="10">10 Baris</SelectItem>
                    <SelectItem value="20">20 Baris</SelectItem>
                    <SelectItem value="all">Semua</SelectItem>
                </SelectContent>
            </Select>

            {/* Tombol Reset Filter */}
            {(filterState.search || filterState.status !== 'all' || filterState.per_page !== '5') && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onReset}
                    title="Reset Filter"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                    <FilterX className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}