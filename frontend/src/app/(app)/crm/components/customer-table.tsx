import React from "react"
import { motion } from "framer-motion"
import { Building, User, Mail, Phone, MoreHorizontal, MessageSquare, Sparkles, Search, History as HistoryIcon } from "lucide-react"

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
import { Card, CardContent } from "@/components/ui/card"

import { Customer, Interaction } from "@/types/crm"

interface CustomerTableProps {
    customers: Customer[];
    interactions: Interaction[];
    expandedRows: Set<string>;
    toggleRow: (id: string) => void;
    onEdit: (customer: Customer) => void;
    onDelete: (id: string) => void;
}

export function CustomerTable({
    customers,
    interactions,
    expandedRows,
    toggleRow,
    onEdit,
    onDelete
}: CustomerTableProps) {

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "Aktif": return "default"
            case "Pasif": return "destructive"
            case "Aday": return "secondary"
            default: return "outline"
        }
    }

    return (
        <Table>
            <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[80px]">Müşteri ID</TableHead>
                    <TableHead>Firma / Kişi Adı</TableHead>
                    <TableHead>Sağlık</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>İletişim Bilgileri</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {customers.length > 0 ? (
                    customers.map((customer) => (
                        <React.Fragment key={customer.id}>
                            <TableRow
                                className={`group transition-all cursor-pointer ${expandedRows.has(customer.id) ? "bg-primary/5 hover:bg-primary/5 border-b-0" : "hover:bg-muted/30"}`}
                                onClick={() => toggleRow(customer.id)}
                            >
                                <TableCell className="font-medium text-xs text-muted-foreground">
                                    {customer.id}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                            {customer.type === "B2B" ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{customer.name}</span>
                                            <span className="text-xs text-muted-foreground mt-0.5 group-hover:text-foreground/80 transition-colors">
                                                {customer.contactName}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 w-24">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className={customer.healthScore > 70 ? "text-green-600" : customer.healthScore > 40 ? "text-orange-500" : "text-destructive"}>
                                                %{customer.healthScore}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${customer.healthScore}%` }}
                                                className={`h-full ${customer.healthScore > 70 ? "bg-green-500" : customer.healthScore > 40 ? "bg-orange-500" : "bg-destructive"}`}
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="text-[10px] tracking-wider font-semibold bg-muted-foreground/10 text-muted-foreground">
                                        {customer.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1.5 text-sm">
                                        <span className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
                                            <Mail className="mr-2 h-3.5 w-3.5" /> {customer.email}
                                        </span>
                                        <span className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
                                            <Phone className="mr-2 h-3.5 w-3.5" /> {customer.phone}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(customer.status)} className="font-medium shadow-none">
                                        {customer.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors">
                                                <span className="sr-only">Menüyü aç</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Aksiyonlar</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onEdit(customer)}>Düzenle</DropdownMenuItem>
                                            <DropdownMenuItem>Fırsat (Deal) Yarat</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:bg-destructive/10"
                                                onClick={() => onDelete(customer.id)}
                                            >
                                                Sil
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            {expandedRows.has(customer.id) && (
                                <TableRow className="bg-primary/5 hover:bg-primary/5 border-t-0 border-b-2 border-b-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <TableCell colSpan={7} className="pb-6 pt-0 px-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-primary/10">
                                            <div className="md:col-span-2 space-y-4">
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                                    <MessageSquare className="h-3 w-3" /> Son Etkileşimler
                                                </h4>
                                                <div className="space-y-3">
                                                    {interactions.filter(i => i.customerId === customer.id).map(i => (
                                                        <div key={i.id} className="flex gap-3 text-xs bg-background/50 p-3 rounded-lg border shadow-sm border-primary/5">
                                                            <div className={`h-6 w-6 rounded-full ${i.color} flex items-center justify-center text-white shrink-0`}>
                                                                {i.icon}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold">{i.title}</p>
                                                                <p className="text-muted-foreground">{i.description}</p>
                                                                <p className="text-[10px] text-primary/60 mt-1 font-medium">{i.date}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3" /> Akıllı Tahmin
                                                </h4>
                                                <Card className="bg-background/80 backdrop-blur-sm border-primary/10 shadow-sm">
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-muted-foreground">Kazanma Olasılığı:</span>
                                                            <span className="font-bold text-green-600">%72</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-muted-foreground">Potansiyel Değer:</span>
                                                            <span className="font-bold">₺240k</span>
                                                        </div>
                                                        <Button size="sm" variant="outline" className="w-full text-[10px] h-8 rounded-full border-primary/20 hover:bg-primary hover:text-white transition-all" onClick={() => onEdit(customer)}>
                                                            Profile Git (360 Görünüm)
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-500">
                                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center ring-4 ring-background">
                                    <Search className="h-6 w-6 text-muted-foreground/60" />
                                </div>
                                <p className="font-medium">Müşteri Bulunamadı</p>
                                <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
                                    Arama kriterlerinize uygun bir kişi veya firma kaydına rastlanmadı. Filtreleri temizleyerek tekrar deneyin.
                                </p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
