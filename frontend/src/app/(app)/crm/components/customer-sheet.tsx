import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building, User, Mail, Phone, MapPin, Upload, FileText, Download, Trash2, Sparkles, HistoryIcon, MessageSquare } from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { customerSchema, CustomerFormValues } from "@/schemas/crm"
import { Customer, Interaction, CustomerFile } from "@/types/crm"

interface CustomerSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingCustomer: CustomerFormValues | null;
    interactions: Interaction[];
    files: CustomerFile[];
    onSubmit: (data: CustomerFormValues) => void;
}

export function CustomerSheet({
    isOpen,
    onOpenChange,
    editingCustomer,
    interactions,
    files,
    onSubmit
}: CustomerSheetProps) {

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema) as any,
        defaultValues: {
            name: "",
            type: "B2B",
            contactName: "",
            email: "",
            phone: "",
            city: "",
            status: "Aday",
            healthScore: 100
        },
    })

    // Update form when editingCustomer changes
    React.useEffect(() => {
        if (editingCustomer) {
            form.reset(editingCustomer)
        } else {
            form.reset({
                name: "",
                type: "B2B",
                contactName: "",
                email: "",
                phone: "",
                city: "",
                status: "Aday",
                healthScore: 100
            })
        }
    }, [editingCustomer, form])

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
                <SheetHeader className="mb-5">
                    <SheetTitle>{editingCustomer ? 'Müşteri Detay (Profile 360)' : 'Yeni Müşteri Profili'}</SheetTitle>
                    <SheetDescription>
                        {editingCustomer
                            ? `${editingCustomer.name} firmanın etkileşim geçmişini ve bilgilerini yönetin.`
                            : 'Müşteri kartı oluşturmak için gerekli bilgileri doldurun.'}
                    </SheetDescription>
                </SheetHeader>

                {editingCustomer ? (
                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-6">
                            <TabsTrigger value="info">Bilgiler</TabsTrigger>
                            <TabsTrigger value="timeline">Akış</TabsTrigger>
                            <TabsTrigger value="files">Dosyalar</TabsTrigger>
                            <TabsTrigger value="ai" className="text-primary font-bold">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI Özeti
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="info">
                            <CustomerForm form={form} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />
                        </TabsContent>
                        <TabsContent value="timeline" className="relative pr-2">
                            <div className="absolute left-4 top-2 bottom-0 w-px bg-muted-foreground/20" />
                            <div className="space-y-8 relative">
                                {interactions.filter(i => i.customerId === editingCustomer.id).length > 0 ? (
                                    interactions
                                        .filter(i => i.customerId === editingCustomer.id)
                                        .map((interaction) => (
                                            <div key={interaction.id} className="relative pl-10">
                                                <div className={`absolute left-0 top-1 h-8 w-8 rounded-full ${interaction.color} flex items-center justify-center text-white border-4 border-background shadow-sm`}>
                                                    {interaction.icon}
                                                </div>
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-sm">{interaction.title}</span>
                                                        <span className="text-[10px] text-muted-foreground">{interaction.date}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        {interaction.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-[10px] py-0">{interaction.type}</Badge>
                                                        <Button variant="link" size="sm" className="h-min p-0 text-[10px] text-primary">Detay</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                                        <HistoryIcon className="h-10 w-10 mb-2" />
                                        <p className="text-sm">Henüz etkileşim kaydı bulunmuyor.</p>
                                    </div>
                                )}
                                <div className="relative pl-10">
                                    <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border-4 border-background shadow-sm italic text-xs">
                                        +
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">Yeni Not Ekle...</Button>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="files">
                            <div className="space-y-6">
                                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/5 group">
                                    <div className="flex flex-col items-center">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-semibold">Dosya Yükle</p>
                                        <p className="text-xs text-muted-foreground mt-1 text-balance">
                                            PDF, Word veya Görsel dosyalarınızı buraya sürükleyin veya tıklayın.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Yüklü Dokümanlar</h4>
                                    {files.filter(f => f.customerId === editingCustomer.id).length > 0 ? (
                                        files
                                            .filter(f => f.customerId === editingCustomer.id)
                                            .map((file) => (
                                                <div key={file.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium leading-none">{file.name}</span>
                                                            <span className="text-[10px] text-muted-foreground mt-1.5">{file.size} • {file.date}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground py-4 text-center border rounded-md bg-muted/10">Bu müşteriye ait dosya bulunmuyor.</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="ai" className="space-y-4">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded bg-primary flex items-center justify-center shrink-0">
                                            <Sparkles className="h-4 w-4 text-primary-foreground" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-primary">Kripteks AI - Müşteri Analizi</h4>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                {editingCustomer.name} ile olan son 3 etkileşiminiz ve şirket sektörel verileri analiz edildiğinde, **satış kapatma ihtimaliniz %72** olarak hesaplanmıştır.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-background rounded p-3 text-xs border border-primary/10">
                                        <p className="font-semibold mb-2">Önerilen Sonraki Adım:</p>
                                        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                            <li>"Bulut entegrasyonu" ilgisi nedeniyle e-posta ile yeni bir teknik sunum iletin.</li>
                                            <li>Önümüzdeki Salı günü telefon ile kısa bir follow-up araması yapın.</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <CustomerForm form={form} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />
                )}
            </SheetContent>
        </Sheet>
    )
}

function CustomerForm({ form, onSubmit, onCancel }: { form: any, onSubmit: any, onCancel: () => void }) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Müşteri Tipi</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                                        <FormControl>
                                            <RadioGroupItem value="B2B" />
                                        </FormControl>
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            <FormLabel className="font-normal cursor-pointer">Kurumsal</FormLabel>
                                        </div>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                                        <FormControl>
                                            <RadioGroupItem value="B2C" />
                                        </FormControl>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <FormLabel className="font-normal cursor-pointer">Bireysel</FormLabel>
                                        </div>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Firma / Kişi Adı</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: Acme A.Ş." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Yetkili Kişi</FormLabel>
                            <FormControl>
                                <Input placeholder="İsim Soyisim" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-Posta Adresi</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input type="email" placeholder="ornek@firma.com" className="pl-9" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telefon Numarası</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input type="tel" placeholder="+90 5XX XXX XX XX" className="pl-9" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Şehir / Bölge</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="İstanbul, TR" className="pl-9" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-6 border-t mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <Button variant="outline" type="button" onClick={onCancel}>İptal</Button>
                    <Button type="submit">Kaydet</Button>
                </div>
            </form>
        </Form>
    )
}
