import { router } from "@inertiajs/react";
import { MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PegawaiForm } from "./pegawai-form";

export function PegawaiTable({ data }: { data: any[] }) {
    const [editingPegawai, setEditingPegawai] = useState<any>(null);

    const deletePegawai = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus El Halcón ini dari ruang jelajah?")) {
            router.delete(router('pegawai.destroy', id));
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Profil</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nomor Telepon</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((pegawai) => (
                            <TableRow key={pegawai.id}>
                                <TableCell>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <User className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{pegawai.name}</TableCell>
                                <TableCell>{pegawai.email}</TableCell>
                                <TableCell>{pegawai.phone_number}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Opsi</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setEditingPegawai(pegawai)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => deletePegawai(pegawai.id)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                Tidak ada data pegawai.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* MODAL EDIT - Muncul saat state editingPegawai terisi */}
            <Dialog open={!!editingPegawai} onOpenChange={() => setEditingPegawai(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Data Pegawai</DialogTitle>
                    </DialogHeader>
                    {editingPegawai && (
                        <PegawaiForm 
                            pegawai={editingPegawai} 
                            onSuccess={() => setEditingPegawai(null)} 
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}