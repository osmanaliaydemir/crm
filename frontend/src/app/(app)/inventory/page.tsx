"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Package,
    Box,
    Tags,
    AlertTriangle,
    Layers,
    Pencil,
    Trash2
} from "lucide-react"
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/api/use-inventory"

import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/page-wrapper"
import { Badge } from "@/components/ui/badge"
import { exportToCSV } from "@/lib/export-utils"
import { TableFilters } from "@/components/table-filters"
import { TableSkeleton } from "@/components/skeletons"
import { Input } from "@/components/ui/input"
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Ürün/Hizmet adı en az 2 karakter olmalıdır."),
    sku: z.string().min(2, "Stok/Hizmet kodu gereklidir."),
    category: z.string().min(2, "Kategori gereklidir."),
    type: z.enum(["Fiziksel", "Hizmet"], { message: "Tip seçimi zorunludur." }),
    price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz."),
    stock: z.preprocess((val) => val === "" || val === null || isNaN(Number(val)) ? null : Number(val), z.number().nullable().optional()),
    status: z.string().min(1, "Durum gereklidir."),
    variants: z.string().optional(),
})

type ProductFormValues = {
    id?: string;
    name: string;
    sku: string;
    category: string;
    type: "Fiziksel" | "Hizmet";
    price: number;
    stock?: number | null;
    status: string;
    variants?: string;
}

export type ProductType = {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stockQuantity: number;
    status: string;
    minimumStockLevel: number;
}

export default function InventoryPage() {
    const { data: products = [], isLoading } = useProducts()
    const { mutate: createProduct } = useCreateProduct()
    const { mutate: updateProduct } = useUpdateProduct()
    const { mutate: deleteProduct } = useDeleteProduct()

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedStatus, setSelectedStatus] = useState("all")

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<ProductType | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<string | null>(null)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            sku: "",
            category: "",
            type: "Fiziksel",
            price: 0,
            stock: 0,
            status: "Aktif",
            variants: ""
        }
    })

    const filteredProducts = products.filter(
        (product: any) => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
            const matchesStatus = selectedStatus === "all" || product.status === selectedStatus

            return matchesSearch && matchesCategory && matchesStatus
        }
    )

    const categories: { label: string; value: string }[] = Array.from(new Set(products.map((p: any) => String(p.category)))).map(cat => ({ label: String(cat), value: String(cat) }))
    const statuses = [
        { label: "Aktif", value: "active" },
        { label: "Stokta Yok", value: "out_of_stock" },
        { label: "Kritik", value: "low_stock" },
    ]

    const handleExport = () => {
        const exportData = filteredProducts.map((p: any) => ({
            'ID': p.id,
            'Ürün Adı': p.name,
            'SKU': p.sku,
            'Kategori': p.category,
            'Fiyat': p.price,
            'Stok': p.stockQuantity ?? 'N/A',
            'Durum': p.status
        }))
        exportToCSV(exportData, "Envanter_Listesi")
        toast.success("Envanter listesi CSV olarak indirildi.")
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Aktif": return <Badge variant="default" className="bg-green-500 hover:bg-green-600 shadow-none font-normal">Aktif</Badge>
            case "Kritik Stok": return <Badge variant="destructive" className="shadow-none font-normal flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Kritik Stok</Badge>
            case "Tükendi": return <Badge variant="secondary" className="shadow-none font-normal text-muted-foreground">Tükendi</Badge>
            default: return <Badge variant="outline" className="shadow-none font-normal">{status}</Badge>
        }
    }

    const getTypeIcon = (type: string) => {
        return type === "Fiziksel" ? <Package className="h-4 w-4 text-orange-500" /> : <Layers className="h-4 w-4 text-blue-500" />
    }

    const openAddDialog = () => {
        setEditingProduct(null)
        form.reset({
            name: "",
            sku: "",
            category: "",
            type: "Fiziksel",
            price: 0,
            stock: 0,
            status: "Aktif",
            variants: ""
        })
        setIsDialogOpen(true)
    }

    const openEditDialog = (product: any) => {
        setEditingProduct(product)
        form.reset({
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            type: "Fiziksel", // Backend'de type yok, şimdilik UI'da Fiziksel olarak gösterelim
            price: product.price,
            stock: product.stockQuantity,
            status: product.status,
            variants: "" // Backend'de variants yok
        })
        setIsDialogOpen(true)
    }

    const onSubmit = (data: ProductFormValues) => {
        let targetStock = data.type === "Hizmet" ? 0 : (data.stock ?? 0)
        let targetStatus = data.status
        if (targetStock === 0 && data.type === "Fiziksel") targetStatus = "Tükendi"
        else if (targetStock > 0 && targetStock < 10 && data.type === "Fiziksel" && targetStatus !== "Pasif") targetStatus = "Kritik Stok"

        const dto = {
            name: data.name,
            sku: data.sku,
            category: data.category,
            price: data.price,
            stockQuantity: targetStock,
            minimumStockLevel: 10, // Default minimum stock level
            status: targetStatus
        }

        if (editingProduct?.id) {
            updateProduct({ id: editingProduct.id, data: dto }, {
                onSuccess: () => {
                    setIsDialogOpen(false)
                }
            })
        } else {
            createProduct(dto, {
                onSuccess: () => {
                    setIsDialogOpen(false)
                }
            })
        }
    }

    const handleDeleteClick = (id: string) => {
        setProductToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (productToDelete) {
            deleteProduct(productToDelete, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false)
                    setProductToDelete(null)
                }
            })
        }
    }

    return (
        <PageWrapper className="flex flex-col h-full gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ürün & Envanter</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Fiziksel ürünlerinizi, stok durumlarını, varyantları ve sunduğunuz hizmetleri yönetin.
                    </p>
                </div>
                <Button className="flex items-center gap-2 group transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20 hover:ring-offset-2" onClick={openAddDialog}>
                    <Plus className="h-4 w-4 transition-transform group-hover:scale-125" />
                    Yeni Kalem Ekle
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? "Kalemi Düzenle" : "Yeni Ürün / Hizmet Kartı"}</DialogTitle>
                        <DialogDescription>
                            Tedarik ettiğiniz veya ürettiğiniz kalemleri kataloğa ekleyin.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kalem Tipi</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Tip seçin" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Fiziksel">Fiziksel Ürün</SelectItem>
                                                    <SelectItem value="Hizmet">Hizmet / Lisans</SelectItem>
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
                                        <FormItem>
                                            <FormLabel>Durum</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Durum seçin" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Aktif">Aktif</SelectItem>
                                                    <SelectItem value="Kritik Stok">Kritik Stok</SelectItem>
                                                    <SelectItem value="Tükendi">Tükendi</SelectItem>
                                                    <SelectItem value="Pasif">Pasif</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ad (Ürün/Hizmet) *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Örn: Lenovo ThinkPad X1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stok/Hizmet Kodu (SKU) *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="PRD-001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kategori *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Örn: Bilgisayar" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Birim Fiyatı (₺)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stok (Hizmet ise boş)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    disabled={form.watch("type") === "Hizmet"}
                                                    {...field}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="variants"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Varyantlar (Virgülle ayırın)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Örn: Kırmızı, Mavi, Siyah" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                                <Button type="submit">Kaydet</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Kalemi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu öğeyi katalogdan silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve geçmiş siparişlerde isim kopyası olarak kalır ancak bağlantısı kopar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card className="border shadow-md bg-linear-to-b from-background to-background/50 overflow-hidden">
                <div className="p-4 border-b bg-muted/10">
                    <TableFilters
                        searchTerm={searchTerm}
                        onSearch={setSearchTerm}
                        activeCategory={selectedCategory}
                        activeStatus={selectedStatus}
                        onCategoryChange={setSelectedCategory}
                        onStatusChange={setSelectedStatus}
                        categories={categories}
                        statuses={statuses}
                        onExport={handleExport}
                    />
                </div>
                <CardContent className="p-0 overflow-x-auto">
                    {isLoading ? (
                        <div className="p-8">
                            <TableSkeleton />
                        </div>
                    ) : (
                        <Table className="min-w-[900px]">
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[120px]">SKU / Tip</TableHead>
                                    <TableHead>Ürün / Hizmet Adı</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Birim Fiyat</TableHead>
                                    <TableHead>Stok</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product: any) => (
                                        <TableRow key={product.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors shrink-0">
                                                        {product.stockQuantity === 0 && product.price > 10000 ? (
                                                            <Layers className="h-4 w-4 text-blue-500 group-hover:text-white transition-colors" />
                                                        ) : (
                                                            <Package className="h-4 w-4 text-orange-500 group-hover:text-white transition-colors" />
                                                        )}
                                                    </div>
                                                    <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors uppercase">{product.sku}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{product.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                                {product.category}
                                            </TableCell>
                                            <TableCell className="font-medium text-primary/90 group-hover:text-primary transition-colors">
                                                ₺{product.price.toLocaleString('tr-TR')}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`font-medium ${product.stockQuantity === 0 ? "text-destructive" : (product.stockQuantity && product.stockQuantity < 10 ? "text-orange-500" : "text-emerald-600 dark:text-emerald-400")}`}>
                                                    {product.stockQuantity} Adet
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(product.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors">
                                                            <span className="sr-only">Menüyü aç</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Aksiyonlar</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                                            <Pencil className="h-4 w-4 mr-2" /> Görüntüle / Düzenle
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(product.id as string)} className="text-destructive focus:bg-destructive/10">
                                                            <Trash2 className="h-4 w-4 mr-2" /> Kataloğdan Kaldır
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-500">
                                                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center ring-4 ring-background">
                                                    <Package className="h-6 w-6 text-muted-foreground/60" />
                                                </div>
                                                <p className="font-medium">Kayıt Bulunamadı</p>
                                                <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
                                                    Aradığınız kriterlere uygun herhangi bir ürün veya hizmet kaydına ulaşılamadı. Filtrelerinizi değiştirip tekrar deneyin.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </PageWrapper>
    )
}
