"use client"

import { useState } from "react"
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Clock,
    CheckCircle2,
    Truck,
    XOctagon,
    FileText,
    Calendar,
    Building,
    User,
    Plus,
    Trash2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { z } from "zod"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PageWrapper } from "@/components/page-wrapper"
import { TableSkeleton } from "@/components/skeletons"
import { useOrders, useCreateOrder, useUpdateOrderStatus } from "@/hooks/api/use-orders"
import { useCustomers } from "@/hooks/api/use-crm"
import { useProducts } from "@/hooks/api/use-inventory"

// Zod Schema
const orderItemSchema = z.object({
    productId: z.string().min(1, "Ürün seçimi zorunludur."),
    qty: z.coerce.number().min(1, "Miktar en az 1 olmalıdır."),
    price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz."),
})

const orderSchema = z.object({
    id: z.string().optional(),
    customerId: z.string().min(1, "Müşteri seçimi zorunludur."),
    status: z.string().min(1, "Durum seçimi zorunludur."),
    items: z.array(orderItemSchema).min(1, "En az bir sipariş kalemi eklenmelidir.")
})

type OrderFormValues = z.infer<typeof orderSchema>

export type OrderItemType = {
    productId: string;
    productName: string;
    qty: number;
    price: number;
}

export type OrderType = {
    id: string;
    customerName: string;
    customerType: "B2B" | "B2C";
    orderDate: string;
    totalAmount: number;
    status: string;
    items: OrderItemType[];
}

export default function OrdersPage() {
    const { data: orders = [], isLoading } = useOrders()
    const { data: customers = [] } = useCustomers()
    const { data: products = [] } = useProducts()

    const { mutate: createOrder } = useCreateOrder()
    const { mutate: updateOrderStatusApi } = useUpdateOrderStatus()

    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState("all")

    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null)

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema) as any,
        defaultValues: {
            customerId: "",
            status: "Yeni Sipariş",
            items: [{ productId: "", qty: 1, price: 0 }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items" as const,
    })

    const onSubmit = (data: OrderFormValues) => {
        const selectedCustomer = customers.find((c: any) => c.id === data.customerId)

        const dto = {
            customerId: data.customerId,
            customerName: selectedCustomer?.name || "",
            customerType: selectedCustomer?.type || "B2B",
            status: data.status,
            orderDate: new Date().toISOString(),
            items: data.items.map(item => {
                const product = products.find((p: any) => p.id === item.productId)
                return {
                    productId: item.productId,
                    productName: product?.name || "",
                    quantity: item.qty,
                    unitPrice: item.price
                }
            })
        }

        createOrder(dto, {
            onSuccess: () => {
                setIsSheetOpen(false)
                form.reset()
            }
        })
    }

    const deleteOrder = () => {
        if (orderToDelete) {
            toast.info("Backend API'da sipariş silme bulunmuyor. Şimdilik listeden düşürülmez, iptal statüsüne çekebilirsiniz.")
            setIsDeleteDialogOpen(false)
            setOrderToDelete(null)
        }
    }

    const updateOrderStatus = (orderId: string, newStatus: string) => {
        updateOrderStatusApi({ id: orderId, status: newStatus })
    }

    // Basit Filtreleme Logic'i
    const filteredOrders = orders.filter((order: any) => {
        const idSearch = order.id ? order.id.toLowerCase() : ""
        const custSearch = order.customerName ? order.customerName.toLowerCase() : ""

        const matchesSearch =
            idSearch.includes(searchTerm.toLowerCase()) ||
            custSearch.includes(searchTerm.toLowerCase())

        let matchesTab = true;
        if (activeTab === "active") matchesTab = ["Yeni Sipariş", "Hazırlanıyor", "Kargoda"].includes(order.status)
        if (activeTab === "completed") matchesTab = order.status === "Tamamlandı"

        return matchesSearch && matchesTab
    })

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "Yeni Sipariş": return { color: "default", icon: Clock }
            case "Hazırlanıyor": return { color: "secondary", icon: FileText }
            case "Kargoda": return { color: "none", className: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none", icon: Truck }
            case "Tamamlandı": return { color: "none", className: "bg-green-100 text-green-700 hover:bg-green-100 border-none", icon: CheckCircle2 }
            case "İptal Edildi": return { color: "destructive", icon: XOctagon }
            default: return { color: "outline", icon: Clock }
        }
    }

    return (
        <PageWrapper className="flex flex-col h-full gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Siparişler & Operasyon</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Müşteri siparişlerini, ürün/hizmet kalemlerini ve teslimat süreçlerini yönetin.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="hidden sm:flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Dışa Aktar
                    </Button>
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button className="flex items-center gap-2 group transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20 hover:ring-offset-2">
                                <Plus className="h-4 w-4 transition-transform group-hover:scale-125" />
                                Yeni Sipariş
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle>Yeni Sipariş Oluştur</SheetTitle>
                                <SheetDescription>
                                    Müşteri detayları ve sipariş kalemlerini ekleyerek yeni operasyon başlatın.
                                </SheetDescription>
                            </SheetHeader>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="customerId"
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel>Müşteri</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Müşteri seçin" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {customers.map((c: any) => (
                                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel>Durum</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Durum seçin" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Yeni Sipariş">Yeni Sipariş</SelectItem>
                                                            <SelectItem value="Hazırlanıyor">Hazırlanıyor</SelectItem>
                                                            <SelectItem value="Kargoda">Kargoda</SelectItem>
                                                            <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold">Sipariş Kalemleri</h4>
                                            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", qty: 1, price: 0 })}>
                                                <Plus className="h-4 w-4 mr-1" /> Kalem Ekle
                                            </Button>
                                        </div>
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2 items-start bg-muted/20 p-3 rounded-lg relative">
                                                <div className="grid grid-cols-12 gap-2 w-full pr-8">
                                                    <div className="col-span-6">
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${index}.productId`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <Select
                                                                        onValueChange={(val) => {
                                                                            field.onChange(val)
                                                                            const product = products.find((p: any) => p.id === val)
                                                                            if (product) form.setValue(`items.${index}.price`, product.price)
                                                                        }}
                                                                        defaultValue={field.value}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Ürün seçin" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {products.map((p: any) => (
                                                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${index}.qty`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Input type="number" placeholder="Adet" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${index}.price`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Input type="number" placeholder="Fiyat" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive absolute right-2 top-2" onClick={() => remove(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {form.formState.errors.items && <p className="text-sm font-medium text-destructive">{form.formState.errors.items.root?.message || "Lütfen kalemleri kontrol edin."}</p>}
                                    </div>

                                    <div className="pt-4 border-t flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>İptal</Button>
                                        <Button type="submit">Siparişi Kaydet</Button>
                                    </div>
                                </form>
                            </Form>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <Card className="border shadow-md bg-linear-to-b from-background to-background/50 overflow-hidden">
                <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                    <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/10">
                        <TabsList className="bg-muted/50">
                            <TabsTrigger value="all">Tüm Siparişler</TabsTrigger>
                            <TabsTrigger value="active">Devam Edenler</TabsTrigger>
                            <TabsTrigger value="completed">Tamamlananlar</TabsTrigger>
                        </TabsList>

                        <div className="flex w-full md:w-auto gap-2">
                            <div className="relative w-full md:w-64 transition-all focus-within:ring-2 focus-within:ring-primary/20 rounded-md">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Sipariş No, Müşteri..."
                                    className="pl-9 bg-muted/40 border-muted-foreground/20 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none transition-colors hover:bg-muted/60 h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[140px]">Sipariş No</TableHead>
                                    <TableHead>Müşteri</TableHead>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead className="text-right">Tutar</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead className="text-right">İşlem</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center text-muted-foreground p-0">
                                            <TableSkeleton />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredOrders.length > 0 ? (
                                    filteredOrders.map((order: any) => {
                                        const statusConfig = getStatusConfig(order.status)
                                        const StatusIcon = statusConfig.icon
                                        const orderDateStr = order.orderDate ? new Date(order.orderDate).toLocaleDateString("tr-TR") : "Belirtilmemiş"

                                        return (
                                            <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-medium text-xs font-mono group-hover:text-primary transition-colors">
                                                    {order.id?.substring(0, 8) || "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors shrink-0">
                                                            {order.customerType === "B2B" ?
                                                                <Building className="h-4 w-4 text-primary group-hover:text-white transition-colors" /> :
                                                                <User className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                                                            }
                                                        </div>
                                                        <span className="font-medium text-sm group-hover:text-foreground/80 transition-colors">{order.customerName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {orderDateStr}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-primary/90 group-hover:text-primary transition-colors">
                                                    ₺{(order.totalAmount || 0).toLocaleString('tr-TR')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={statusConfig.color as any}
                                                        className={`font-normal flex w-fit items-center gap-1.5 ${statusConfig.className || ''}`}
                                                    >
                                                        <StatusIcon className="h-3 w-3" />
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Sheet>
                                                        <SheetTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="hidden sm:inline-flex items-center gap-1 mr-2 text-primary hover:text-primary">
                                                                <Eye className="h-4 w-4" /> Detay
                                                            </Button>
                                                        </SheetTrigger>
                                                        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                                                            <SheetHeader className="mb-6">
                                                                <SheetTitle className="flex items-center gap-2">
                                                                    <span>{order.id}</span>
                                                                    <Badge variant={statusConfig.color as any} className={`ml-2 text-xs font-normal ${statusConfig.className || ''}`}>
                                                                        {order.status}
                                                                    </Badge>
                                                                </SheetTitle>
                                                                <SheetDescription>
                                                                    {order.customer} adına oluşturulan sipariş detayı.
                                                                </SheetDescription>
                                                            </SheetHeader>

                                                            <div className="flex flex-col gap-6">
                                                                {/* Sipariş Özeti Kartı */}
                                                                <div className="rounded-lg border bg-card p-4 shadow-sm">
                                                                    <h4 className="text-sm font-semibold mb-3">Müşteri & Operasyon Bilgisi</h4>
                                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-muted-foreground">Oluşturulma</span>
                                                                            <span className="font-medium">{orderDateStr}</span>
                                                                        </div>
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-muted-foreground">Teslimat Tipi</span>
                                                                            <span className="font-medium">Standart Kargo / Adrese Teslim</span>
                                                                        </div>
                                                                        <div className="flex flex-col gap-1 col-span-2">
                                                                            <span className="text-muted-foreground">Firma / İlgili Kişi</span>
                                                                            <span className="font-medium">{order.customerName}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Satış Kalemleri */}
                                                                <div>
                                                                    <h4 className="text-sm font-semibold mb-3">Sipariş Kalemleri</h4>
                                                                    <div className="rounded-md border">
                                                                        <Table>
                                                                            <TableHeader className="bg-muted/50">
                                                                                <TableRow>
                                                                                    <TableHead>Ürün/Hizmet Hizmet</TableHead>
                                                                                    <TableHead className="text-right">Miktar</TableHead>
                                                                                    <TableHead className="text-right">Tutar</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {order.items?.map((item: any, i: number) => (
                                                                                    <TableRow key={i}>
                                                                                        <TableCell className="text-sm font-medium">{item.productName}</TableCell>
                                                                                        <TableCell className="text-sm text-right">{item.quantity}</TableCell>
                                                                                        <TableCell className="text-sm text-right">₺{(item.unitPrice || 0).toLocaleString('tr-TR')}</TableCell>
                                                                                    </TableRow>
                                                                                ))}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                </div>

                                                                {/* Toplamlar */}
                                                                <div className="flex justify-end border-t pt-4">
                                                                    <div className="w-1/2 space-y-2 text-sm">
                                                                        <div className="flex justify-between text-muted-foreground">
                                                                            <span>Ara Toplam</span>
                                                                            <span>₺{((order.totalAmount || 0) * 0.8).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-muted-foreground">
                                                                            <span>KDV (%20)</span>
                                                                            <span>₺{((order.totalAmount || 0) * 0.2).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                                                                        </div>
                                                                        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                                                            <span>Genel Toplam</span>
                                                                            <span>₺{(order.totalAmount || 0).toLocaleString('tr-TR')}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </SheetContent>
                                                    </Sheet>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Menüyü aç</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                                            <DropdownMenuItem className="sm:hidden">Görüntüle</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "Hazırlanıyor")}>Hazırlanıyor Yap</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "Kargoda")}>Kargoya Ver</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "Tamamlandı")}>Tamamlandı İşaretle</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:bg-destructive/10"
                                                                onClick={() => {
                                                                    setOrderToDelete(order.id)
                                                                    setIsDeleteDialogOpen(true)
                                                                }}
                                                            >İptal Et / Sil</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-500">
                                                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center ring-4 ring-background">
                                                    <FileText className="h-6 w-6 text-muted-foreground/60" />
                                                </div>
                                                <p className="font-medium">Sipariş Bulunamadı</p>
                                                <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
                                                    Arama kriterlerinize veya seçili sekmeye uygun herhangi bir sipariş kaydı bulunmamaktadır.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Tabs>
            </Card>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Siparişi İptal Etmek / Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Sipariş kalıcı olarak listeden silinecek ve ilgili operasyon durdurulacaktır.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Siparişi Sil</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageWrapper>
    )
}
