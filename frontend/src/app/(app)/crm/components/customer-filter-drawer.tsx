import React from "react"
import { SlidersHorizontal } from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CustomerFilterDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: () => void;
}

export function CustomerFilterDrawer({
    isOpen,
    onOpenChange,
    onApply
}: CustomerFilterDrawerProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <div className="flex items-center gap-2 text-primary">
                        <SlidersHorizontal className="h-5 w-5" />
                        <SheetTitle>Gelişmiş Filtreleme</SheetTitle>
                    </div>
                    <SheetDescription>
                        Müşteri listesini detay kriterlere göre daraltın.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-6">
                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Müşteri Tipi</Label>
                        <Select defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="Tümü" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Tipler</SelectItem>
                                <SelectItem value="b2b">B2B (Kurumsal)</SelectItem>
                                <SelectItem value="b2c">B2C (Bireysel)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Durum</Label>
                        <div className="flex flex-wrap gap-2">
                            {["Hepsi", "Aktif", "Pasif", "Aday"].map((status) => (
                                <Badge key={status} variant={status === "Hepsi" ? "default" : "outline"} className="cursor-pointer px-3 py-1">
                                    {status}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Şehir</Label>
                        <Input placeholder="Şehir adı yazın..." />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Son Görüşme Tarihi</Label>
                        <Select defaultValue="30">
                            <SelectTrigger>
                                <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Son 7 Gün</SelectItem>
                                <SelectItem value="30">Son 30 Gün</SelectItem>
                                <SelectItem value="90">Son 90 Gün</SelectItem>
                                <SelectItem value="ever">Tüm Zamanlar</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t">
                    <div className="flex w-full gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Temizle</Button>
                        <Button className="flex-1" onClick={onApply}>Sonuçları Gör</Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
