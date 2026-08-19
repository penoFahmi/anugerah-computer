import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';

interface ImportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ImportExcelModal({ isOpen, onClose }: ImportExcelModalProps) {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('file', e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setData('file', e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!data.file) return;
        post('/services/import', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <FileSpreadsheet className="h-5 w-5" />
                        Import Data Servisan
                    </DialogTitle>
                    <DialogDescription>
                        Unggah file Excel atau CSV untuk memigrasi data dari sistem lama.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full flex justify-between group hover:border-emerald-500 hover:text-emerald-600"
                        onClick={() => window.location.href = '/services/export?template=1'}
                    >
                        <span className="flex items-center gap-2">
                            <Download className="h-4 w-4" /> Unduh Template CSV
                        </span>
                        <span className="text-xs text-muted-foreground group-hover:text-emerald-500">Wajib</span>
                    </Button>

                    <div 
                        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${
                            dragActive ? 'border-primary bg-primary/5' : 
                            data.file ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 
                            'border-muted-foreground/25 hover:border-primary/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleChange}
                            className="hidden"
                        />
                        
                        {!data.file ? (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                                <p className="text-sm font-medium text-center">Tarik & Lepas file ke sini</p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4 text-center">atau</p>
                                <Button 
                                    type="button" 
                                    size="sm" 
                                    variant="secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Pilih File
                                </Button>
                            </>
                        ) : (
                            <>
                                <FileSpreadsheet className="h-8 w-8 text-emerald-600 mb-2" />
                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 text-center truncate max-w-full px-4">
                                    {data.file.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">
                                    {(data.file.size / 1024).toFixed(2)} KB
                                </p>
                                <Button 
                                    type="button" 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => setData('file', null)}
                                >
                                    <X className="h-4 w-4 mr-1" /> Hapus File
                                </Button>
                            </>
                        )}
                    </div>
                    {errors.file && (
                        <p className="text-sm text-red-500 text-center">{errors.file}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>
                        Batal
                    </Button>
                    <Button 
                        onClick={handleUpload} 
                        disabled={!data.file || processing}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {processing ? 'Mengunggah...' : 'Import Data'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
