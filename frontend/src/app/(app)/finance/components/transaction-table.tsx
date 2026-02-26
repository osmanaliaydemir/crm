import React from "react"
import { MoreHorizontal, Search } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Transaction, TransactionStatus } from "@/types/finance"

interface TransactionTableProps {
    transactions: Transaction[];
    searchTerm: string;
    onUpdateStatus: (id: string, status: TransactionStatus) => void;
    onDelete: (id: string) => void;
}

export function TransactionTable({
    transactions,
    searchTerm,
    onUpdateStatus,
    onDelete
}: TransactionTableProps) {

    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((trx) => (
                        <TableRow key={trx.id} className="group hover:bg-muted/30 transition-colors">
                            <TableCell className="text-muted-foreground text-sm font-medium whitespace-nowrap group-hover:text-foreground/80 transition-colors">
                                {trx.date}
                            </TableCell>
                            <TableCell className="font-medium group-hover:text-primary transition-colors">
                                {trx.description}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                    {trx.category}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={trx.status === "Tamamlandı" ? "secondary" : "outline"} className="font-normal">
                                    {trx.status}
                                </Badge>
                            </TableCell>
                            <TableCell className={`text-right font-medium whitespace-nowrap ${trx.type === 'in' ? 'text-green-600' : ''}`}>
                                {trx.type === "in" ? "+" : "-"} ₺{trx.amount.toLocaleString('tr-TR')}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Menüyü aç</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => onUpdateStatus(trx.id, "Tamamlandı")}>Tamamlandı İşaretle</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onUpdateStatus(trx.id, "Bekliyor")}>Bekliyor Yap</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:bg-destructive/10 cursor-pointer"
                                            onClick={() => onDelete(trx.id)}
                                        >
                                            İşlemi İptal Et / Sil
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-500">
                                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center ring-4 ring-background">
                                    <Search className="h-6 w-6 text-muted-foreground/60" />
                                </div>
                                <p className="font-medium">İşlem Bulunamadı</p>
                                <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
                                    Arama kriterlerinize uyan herhangi bir finansal işlem kaydı bulunmamaktadır.
                                </p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
