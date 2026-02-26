"use client"

import { useState } from "react"
import { Building2, Plus, GripVertical, Settings2, Trash2, ShieldCheck, Mail, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
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

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PageWrapper } from "@/components/page-wrapper"

const customFieldSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(2, "Alan adı en az 2 karakter olmalıdır"),
    entity: z.enum(["Müşteri (CRM)", "Siparişler", "Finans", "Ürünler"], { message: "Modül seçimi zorunludur" }),
    type: z.enum(["Metin", "Sayı", "Tarih", "Çoktan Seçmeli", "Doğru/Yanlış"], { message: "Alan tipi seçimi zorunludur" }),
    required: z.boolean().default(false)
})

type CustomFieldFormValues = z.infer<typeof customFieldSchema>

export type CustomFieldType = {
    id: number;
    name: string;
    entity: string;
    type: string;
    required: boolean;
}

const initialCustomFields: CustomFieldType[] = [
    { id: 1, name: "Vergi Dairesi", entity: "Müşteri (CRM)", type: "Metin", required: true },
    { id: 2, name: "Sektör", entity: "Müşteri (CRM)", type: "Çoktan Seçmeli", required: false },
    { id: 3, name: "Sözleşme Bitiş", entity: "Siparişler", type: "Tarih", required: true },
]

export default function CompanySettingsPage() {
    const [customFields, setCustomFields] = useState<CustomFieldType[]>(initialCustomFields)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [fieldToDelete, setFieldToDelete] = useState<number | null>(null)

    const form = useForm<CustomFieldFormValues>({
        resolver: zodResolver(customFieldSchema) as any,
        defaultValues: {
            name: "",
            entity: "Müşteri (CRM)",
            type: "Metin",
            required: false
        }
    })

    const onSubmit = (data: CustomFieldFormValues) => {
        const newField: CustomFieldType = {
            id: customFields.length + 1,
            name: data.name,
            entity: data.entity,
            type: data.type,
            required: data.required
        }

        setCustomFields([...customFields, newField])
        toast.success("Yeni özel alan oluşturuldu.")
        setIsDialogOpen(false)
        form.reset()
    }

    const deleteField = () => {
        if (fieldToDelete !== null) {
            setCustomFields(customFields.filter(f => f.id !== fieldToDelete))
            toast.success("Özel alan silindi.")
            setIsDeleteDialogOpen(false)
            setFieldToDelete(null)
        }
    }

    return (
        <PageWrapper className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Firma Ayarları</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Şirketinizin temel profili, logo, fatura bilgileri ve dinamik veri modeli (özel alanlar).
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Temel Profil */}
                <Card className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-linear-to-b from-background to-muted/10">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Firma Profili
                        </CardTitle>
                        <CardDescription>Resmi evraklarda (Teklif, Fatura) görünecek bilgileriniz.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <div className="size-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors relative overflow-hidden">
                                <Building2 className="size-8 mb-1 opacity-50" />
                                <span className="text-xs font-semibold">Logo Yükle</span>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Firma Resmi Ünvanı</label>
                            <Input defaultValue="Universal Yazılım Teknolojileri A.Ş." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vergi Dairesi</label>
                                <Input defaultValue="Zincirlikuyu" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vergi Numarası</label>
                                <Input defaultValue="8930492811" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Merkez Adres</label>
                            <Input defaultValue="Levent Mah. Çayır Çimen Sk. No:3 Beşiktaş / İstanbul" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/20 pt-4 flex justify-end">
                        <Button>Profili Kaydet</Button>
                    </CardFooter>
                </Card>

                {/* Yerel & Sistem Ayarları */}
                <div className="space-y-6 flex flex-col">
                    <Card className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-primary" />
                                Bölgesel ve Finansal Ayarlar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Ana Para Birimi</label>
                                    <Select defaultValue="TRY">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seçiniz" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TRY">TRY - Türk Lirası (₺)</SelectItem>
                                            <SelectItem value="USD">USD - Amerikan Doları ($)</SelectItem>
                                            <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Saat Dilimi</label>
                                    <Select defaultValue="IST">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seçiniz" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IST">(UTC+03:00) Istanbul</SelectItem>
                                            <SelectItem value="LON">(UTC+00:00) London</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg mt-2">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-semibold">Çoklu Döviz (Multi-currency)</label>
                                    <p className="text-xs text-muted-foreground">Sistemde $ ve € faturaya/ürüne izin verilir.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm flex-1 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary" />
                                SMTP / Mail Sunucu
                            </CardTitle>
                            <CardDescription>Müşterilere gidecek PDF teklifler ve furaların gönderileceği adres.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Gönderici (From) Adresi</label>
                                <Input defaultValue="noreply@universal.com.tr" />
                            </div>
                            <Button variant="secondary" className="w-full">
                                SMTP Bilgilerini Yapılandır
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator className="my-2" />

            {/* DİNAMİK ALANLAR (CUSTOM FIELDS) - Projenin kalbi */}
            <Card className="shadow-sm border-primary/20">
                <CardHeader className="bg-primary/5 pb-4 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-3">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                Dinamik Veri Modeli (Özel Alanlar)
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Sistemdeki Müşteri, Sipariş veya Ürün tablolarına ihtiyaç duyduğunuz yeni veri sütünlarını (JSON formatında) ekleyin.
                            </CardDescription>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="shrink-0 group transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20 hover:ring-offset-2">
                                    <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                                    Yeni Alan Oluştur
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Yeni Dinamik Alan (Custom Field)</DialogTitle>
                                    <DialogDescription>
                                        Sisteminizdeki modüllere özgü veri yapınızı tanımlayın.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Alan Adı</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Örn: TC Kimlik No" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="entity"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bağlı Modül</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Modül Seçin" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Müşteri (CRM)">Müşteri (CRM)</SelectItem>
                                                                <SelectItem value="Siparişler">Siparişler</SelectItem>
                                                                <SelectItem value="Finans">Finans</SelectItem>
                                                                <SelectItem value="Ürünler">Ürünler</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Veri Tipi</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Veri Tipi" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Metin">Metin (Text)</SelectItem>
                                                                <SelectItem value="Sayı">Sayı (Number)</SelectItem>
                                                                <SelectItem value="Tarih">Tarih (Date)</SelectItem>
                                                                <SelectItem value="Çoktan Seçmeli">Çoktan Seçmeli</SelectItem>
                                                                <SelectItem value="Doğru/Yanlış">Doğru/Yanlış (Boolean)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="required"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Bu Alan Zorunlu Mu?</FormLabel>
                                                        <p className="text-[0.8rem] text-muted-foreground">Kayıt girilirken boş bırakmaya izin verme.</p>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="pt-4 border-t flex justify-end gap-2">
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                                            <Button type="submit">Alanı Ekle</Button>
                                        </div>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Alan Adı</TableHead>
                                <TableHead>Bağlı Olduğu Modül</TableHead>
                                <TableHead>Veri Tipi</TableHead>
                                <TableHead>Zorunlu</TableHead>
                                <TableHead className="text-right">İşlem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customFields.map((field) => (
                                <TableRow key={field.id} className="group cursor-default hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab active:cursor-grabbing group-hover:text-muted-foreground transition-colors" />
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">
                                        {field.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-normal border-primary/20 text-primary">
                                            {field.entity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm px-2 py-1 bg-muted rounded-md tracking-tight">
                                            {field.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Switch checked={field.required} disabled />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                setFieldToDelete(field.id)
                                                setIsDeleteDialogOpen(true)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Add New Mock Row */}
                            <TableRow className="bg-muted/10 hover:bg-muted/10">
                                <TableCell></TableCell>
                                <TableCell colSpan={5}>
                                    <p className="text-xs text-muted-foreground italic text-center py-2">
                                        Eklediğiniz alanlar ilgili ekranın "Ekle/Düzenle" formlarına otomatik render edilir.
                                    </p>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>İlgili Alanı Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Bu alana ait sistemdeki tüm tanımlanmış Müşteri/Sipariş verileri silinecektir. Lütfen veritabanı yedeği aldığınızdan emin olun!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteField} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Kalıcı Olarak Sil</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageWrapper>
    )
}
