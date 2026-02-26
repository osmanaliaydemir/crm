"use client"

import { useState } from "react"
import { Printer, Plus, Trash2, Download, Building2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

type InvoiceItem = {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

export function InvoiceGenerator() {
    const [invoiceNo, setInvoiceNo] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    // Customer Info
    const [customerName, setCustomerName] = useState("")
    const [customerAddress, setCustomerAddress] = useState("")
    const [customerTaxId, setCustomerTaxId] = useState("")

    // Line Items
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: `item-${Date.now()}`, description: "Danışmanlık Hizmeti", quantity: 1, price: 15000 }
    ])

    const addItem = () => {
        setItems([...items, { id: `item-${Date.now()}-${Math.random()}`, description: "", quantity: 1, price: 0 }])
    }

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id))
        } else {
            toast.error("Faturada en az bir kalem bulunmalıdır.")
        }
    }

    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
    }

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)
    const taxRate = 0.20 // 20% KDV
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
    }

    const handlePrint = () => {
        if (!customerName) {
            toast.error("Lütfen müşteri bilgilerini doldurun.")
            return
        }
        window.print()
    }

    return (
        <div className="flex flex-col gap-6 h-full relative overflow-hidden">
            <div className="flex justify-between items-center print:hidden shrink-0">
                <div>
                    <h3 className="text-xl font-bold">Fatura Taslağı Oluştur</h3>
                    <p className="text-sm text-muted-foreground">PDF olarak indirmek veya yazdırmak için fatura detaylarını doldurun.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => toast.success("Taslak kaydedildi.")}>
                        <Save className="h-4 w-4 mr-2" /> Kaydet
                    </Button>
                    <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
                        <Printer className="h-4 w-4 mr-2" /> Faturayı Yazdır / PDF
                    </Button>
                </div>
            </div>

            {/* Printable A4 Canvas Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border print:p-0 print:border-none print:bg-white print:overflow-visible flex justify-center items-start">

                {/* 
                    Bu div "A4 Formatına" ayarlanmıştır.
                    Ekranda sınırlı genişlikte ortalanır, sayfaya sığar.
                    Ancak yazdırılmak istendiğinde 'print:fixed print:inset-0' 
                    ile tüm ekranı bembeyaz kaplayıp A4 kağıdına kusursuz oturur.
                */}
                <div className="w-full max-w-[21cm] shrink-0 bg-white dark:bg-card text-zinc-900 dark:text-card-foreground shadow-md ring-1 ring-zinc-200 dark:ring-white/10 p-8 sm:p-12 print:shadow-none print:ring-0 print:border-none print:fixed print:inset-0 print:z-9999 print:bg-white print:text-zinc-950 print:m-0 print:w-full print:max-w-none print:min-h-screen">

                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b pb-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight">UNIVERSAL A.Ş.</span>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>Levent Mah. Büyükdere Cad. No: 123</p>
                                <p>Beşiktaş, İstanbul, Türkiye 34330</p>
                                <p>Vergi Dairesi: Beşiktaş | VKN: 1234567890</p>
                                <p>info@universal.com.tr | +90 (212) 555 00 00</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-light text-muted-foreground tracking-widest uppercase mb-4">Fatura</h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <span className="text-muted-foreground font-medium">Fatura No:</span>
                                <span className="font-semibold">{invoiceNo}</span>
                                <span className="text-muted-foreground font-medium">Tarih:</span>
                                <span className="font-semibold">{new Date(date).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-12 mb-10">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-wider border-b pb-2">Müşteri / Cari Bilgileri</h4>
                            <div className="space-y-3 print:hidden">
                                <div className="space-y-1">
                                    <Label className="text-xs">Firma Ünvanı / Ad Soyad</Label>
                                    <Input
                                        placeholder="Müşteri Adı"
                                        value={customerName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Adres Bilgisi</Label>
                                    <Textarea
                                        placeholder="Müşteri Adresi"
                                        value={customerAddress}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomerAddress(e.target.value)}
                                        className="min-h-[60px] resize-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Vergi Dairesi & VKN</Label>
                                    <Input
                                        placeholder="Örn: Mecidiyeköy VD - 1112223334"
                                        value={customerTaxId}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerTaxId(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Print Version of Customer Info */}
                            <div className="hidden print:block space-y-1 text-sm">
                                <p className="font-bold text-lg">{customerName || "Sayın Müşteri"}</p>
                                <p className="whitespace-pre-wrap">{customerAddress || "Adres bilgisi girilmedi."}</p>
                                <p className="pt-2 font-medium">{customerTaxId ? `VD / VKN: ${customerTaxId}` : ""}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-wider border-b pb-2">Fatura Şartları (Opsiyonel)</h4>
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p><strong>Vade:</strong> 30 Gün</p>
                                <p><strong>Para Birimi:</strong> Türk Lirası (₺)</p>
                                <p><strong>Ödeme Yöntemi:</strong> Havale / EFT</p>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="mb-8">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 pb-2 border-b-2 border-primary/20 text-sm font-bold text-muted-foreground mb-4">
                            <div className="col-span-6 md:col-span-7">Hizmet / Ürün Açıklaması</div>
                            <div className="col-span-2 text-center">Miktar</div>
                            <div className="col-span-2 text-right">Birim Fiyat</div>
                            <div className="col-span-2 md:col-span-1 text-right">Tutar</div>
                            <div className="col-span-1 text-center print:hidden">Sil</div>
                        </div>

                        {/* Table Rows */}
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-4 items-center group">
                                    <div className="col-span-6 md:col-span-7">
                                        <Input
                                            placeholder="Ürün veya hizmet adını giriniz..."
                                            value={item.description}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, 'description', e.target.value)}
                                            className="h-9 border-transparent hover:border-input focus:border-input bg-transparent print:border-none print:p-0 print:font-medium transition-colors"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                            className="h-9 text-center border-transparent hover:border-input focus:border-input bg-transparent print:border-none print:p-0 transition-colors"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <div className="relative">
                                            <span className="absolute left-2 top-2 text-xs text-muted-foreground print:hidden">₺</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.price}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                                className="h-9 text-right pl-6 border-transparent hover:border-input focus:border-input bg-transparent print:border-none print:p-0 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2 md:col-span-1 text-right font-medium text-sm pt-2 print:pt-0">
                                        {formatCurrency(item.quantity * item.price)}
                                    </div>
                                    <div className="col-span-1 text-center print:hidden">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Item Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={addItem}
                            className="mt-4 text-muted-foreground hover:text-primary print:hidden border border-dashed border-muted-foreground/30 w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Yeni Satır Ekle
                        </Button>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end border-t pt-6">
                        <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 space-y-3">
                            <div className="flex justify-between text-sm text-muted-foreground font-medium">
                                <span>Ara Toplam:</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground font-medium">
                                <span>KDV (%20):</span>
                                <span>{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2 text-primary">
                                <span>Genel Toplam:</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-24 pt-8 border-t text-center text-xs text-muted-foreground">
                        <p>Bu fatura bilgisayar ortamında oluşturulmuş olup, sevk irsaliyesi yerine geçmez.</p>
                        <p className="mt-1">Sorularınız için bizimle <span className="font-semibold text-foreground">info@universal.com.tr</span> adresinden iletişime geçebilirsiniz.</p>
                    </div>

                </div>
            </div>
        </div>
    )
}
