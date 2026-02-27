"use client"

import { useState } from "react"
import {
    Briefcase,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    Plus,
    Search,
    ListTodo,
    AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/page-wrapper"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { exportToCSV } from "@/lib/export-utils"
import { TableFilters } from "@/components/table-filters"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
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
} from "@/components/ui/alert-dialog"
import { Trash2, Edit } from "lucide-react"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { useProjects, useCreateProject } from "@/hooks/api/use-projects"

const projectSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Proje adı en az 2 karakter olmalıdır."),
    client: z.string().min(2, "Müşteri adı gereklidir."),
    status: z.enum(["Tamamlandı", "Devam Ediyor", "Gecikmiş", "Başlamadı"], { message: "Durum seçimi zorunludur." }),
    progress: z.coerce.number().min(0).max(100),
    dueDate: z.string().optional(),
    manager: z.string().min(2, "Yönetici adı gereklidir.")
})

type ProjectFormValues = z.infer<typeof projectSchema>

export type ProjectType = {
    id: string;
    name: string;
    client: string;
    status: string;
    progress: number;
    dueDate: string;
    manager: string;
    tasksCompleted: number;
    tasksTotal: number;
}

// Mock Projeler
const initialProjects: ProjectType[] = [
    {
        id: "PRJ-001",
        name: "TechCorp ERP Entegrasyonu",
        client: "TechCorp A.Ş.",
        status: "Devam Ediyor",
        progress: 65,
        dueDate: "15 Kas 2023",
        manager: "Osman Ali",
        tasksCompleted: 12,
        tasksTotal: 18
    },
    {
        id: "PRJ-002",
        name: "E-Ticaret Altyapı Yenileme",
        client: "Can Tekstil",
        status: "Başlamadı",
        progress: 0,
        dueDate: "01 Ara 2023",
        manager: "Ahmet Yılmaz",
        tasksCompleted: 0,
        tasksTotal: 24
    },
    {
        id: "PRJ-003",
        name: "KVKK Danışmanlık ve Denetim",
        client: "Global Lojistik",
        status: "Gecikmiş",
        progress: 85,
        dueDate: "20 Eki 2023",
        manager: "Zeynep Ata",
        tasksCompleted: 45,
        tasksTotal: 50
    },
    {
        id: "PRJ-004",
        name: "Sunucu Taşıma Operasyonu",
        client: "Local Bank A.Ş.",
        status: "Tamamlandı",
        progress: 100,
        dueDate: "10 Eki 2023",
        manager: "Osman Ali",
        tasksCompleted: 15,
        tasksTotal: 15
    }
]

export default function ProjectsPage() {
    const { data: projects = [], isLoading } = useProjects()
    const { mutate: createProject } = useCreateProject()

    // Yöneticileri API'dan gelen projelerden çekelim
    const managerSet = new Set<string>()
    projects.forEach((p: any) => {
        if (p.manager) managerSet.add(p.manager)
    })
    const managers = Array.from(managerSet).map(m => ({ label: m, value: m }))

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedManager, setSelectedManager] = useState("all")
    const [activeTab, setActiveTab] = useState("all")

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema) as any,
        defaultValues: {
            name: "",
            client: "",
            status: "Devam Ediyor",
            progress: 0,
            dueDate: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
            manager: ""
        }
    })

    const filteredProjects = projects.filter((prj: any) => {
        const matchesSearch = prj.name.toLowerCase().includes(searchTerm.toLowerCase()) || (prj.customerName && prj.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesManager = selectedManager === "all" || prj.manager === selectedManager

        let matchesTab = true
        if (activeTab === "active") matchesTab = (prj.status === "Devam Ediyor" || prj.status === "Başlamadı" || prj.status === "Gecikmiş")
        else if (activeTab === "completed") matchesTab = prj.status === "Tamamlandı"

        return matchesSearch && matchesManager && matchesTab
    })

    const statuses = [
        { label: "Tamamlandı", value: "Tamamlandı" },
        { label: "Devam Ediyor", value: "Devam Ediyor" },
        { label: "Gecikmiş", value: "Gecikmiş" },
        { label: "Başlamadı", value: "Başlamadı" },
    ]

    const handleExport = () => {
        const exportData = filteredProjects.map((p: any) => ({
            'ID': p.id,
            'Proje Adı': p.name,
            'Müşteri': p.customerName || p.client || "-",
            'Yönetici': p.manager || "-",
            'Durum': p.status,
            'İlerleme': `%${p.progress || 0}`,
            'Teslim Tarihi': p.dueDate || p.startDate,
            'Tamamlanan Görev': p.tasks?.filter((t: any) => t.status === "Done").length || 0,
            'Toplam Görev': p.tasks?.length || 0
        }))
        exportToCSV(exportData, "Projeler_Listesi")
        toast.success("Proje listesi CSV olarak indirildi.")
    }

    const onSubmit = (data: ProjectFormValues) => {
        const formattedData = {
            name: data.name,
            // Mock Müşteri (Şimdilik boş geçiyoruz, gerçekte select list'ten CustomerId gelir)
            description: "Proje Detayları",
            startDate: new Date().toISOString(),
            status: data.status
        }
        createProject(formattedData, {
            onSuccess: () => {
                setIsDialogOpen(false)
                form.reset()
            }
        })
    }

    const deleteProject = () => {
        if (projectToDelete) {
            toast.info("Proje silme işlemi API'ye eklendikten sonra tamamlanacak.")
            setIsDeleteDialogOpen(false)
            setProjectToDelete(null)
        }
    }

    const updateProjectStatus = (id: string, newStatus: string) => {
        toast.info("Proje durumu güncelleme API servisi eklendiğinde devreye girecek.")
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Tamamlandı": return <Badge variant="secondary" className="font-normal  bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200">Tamamlandı</Badge>
            case "Devam Ediyor": return <Badge variant="default" className="font-normal bg-blue-500 hover:bg-blue-600 shadow-none">Devam Ediyor</Badge>
            case "Gecikmiş": return <Badge variant="destructive" className="font-normal shadow-none flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Gecikmiş</Badge>
            default: return <Badge variant="outline" className="font-normal text-muted-foreground">{status}</Badge>
        }
    }

    return (
        <PageWrapper className="flex flex-col h-full gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projeler & Operasyon</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Onaylanan siparişlerin teslimat süreçlerini, müşteri projelerini ve alt görevleri (Task) takip edin.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <ListTodo className="h-4 w-4" />
                        Görevlerim
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 group transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20 hover:ring-offset-2">
                                <Plus className="h-4 w-4 transition-transform group-hover:scale-125" />
                                Yeni Proje
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Yeni Proje Mimarisi</DialogTitle>
                                <DialogDescription>
                                    Müşteri projelerini, yazılım operasyonlarını veya şirket içi büyük süreçleri takip edin.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Proje Adı</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Muhasebe Entegrasyonu vb." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="client"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Müşteri / Kurum</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="TechCorp A.Ş." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="manager"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Proje Yöneticisi</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Osman Ali" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
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
                                                            <SelectItem value="Başlamadı">Başlamadı</SelectItem>
                                                            <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                                                            <SelectItem value="Gecikmiş">Gecikmiş</SelectItem>
                                                            <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dueDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Teslim Tarihi</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" placeholder="15 Kas 2023" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="pt-4 border-t flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                                        <Button type="submit">Projeyi Oluştur</Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Proje Özet Kartları */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-linear-to-b from-background to-muted/10">
                    <CardContent className="pt-6 flex flex-col items-center justify-center space-y-2">
                        <Briefcase className="h-8 w-8 text-blue-500" />
                        <h3 className="text-3xl font-bold">12</h3>
                        <p className="text-sm font-medium text-muted-foreground">Aktif Projeler</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-linear-to-b from-background to-muted/10">
                    <CardContent className="pt-6 flex flex-col items-center justify-center space-y-2">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <h3 className="text-3xl font-bold">45</h3>
                        <p className="text-sm font-medium text-muted-foreground">Tamamlanan (Bu Yıl)</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-linear-to-b from-background to-muted/10">
                    <CardContent className="pt-6 flex flex-col items-center justify-center space-y-2">
                        <Clock className="h-8 w-8 text-orange-500" />
                        <h3 className="text-3xl font-bold">3</h3>
                        <p className="text-sm font-medium text-muted-foreground">Yaklaşan Teslimatlar</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-linear-to-b from-background to-muted/10">
                    <CardContent className="pt-6 flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <h3 className="text-3xl font-bold">1</h3>
                        <p className="text-sm font-medium text-red-500">Geciken Proje</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border shadow-md bg-linear-to-b from-background to-background/50 flex-1 flex flex-col min-h-0">
                <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/10 rounded-t-xl shrink-0">
                    <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="bg-muted/50">
                            <TabsTrigger value="all">Tüm Projeler</TabsTrigger>
                            <TabsTrigger value="active">Aktif Olanlar</TabsTrigger>
                            <TabsTrigger value="completed">Tamamlananlar</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="w-full sm:w-auto flex-1 max-w-2xl">
                        <TableFilters
                            searchTerm={searchTerm}
                            onSearch={setSearchTerm}
                            activeCategory={selectedManager}
                            onCategoryChange={setSelectedManager}
                            categories={managers}
                            // Status select'i burada pas geçiyoruz çünkü Tabs zaten var, 
                            // ama istersekStatuses'u da verebiliriz. Şimdilik sadece manager yeterli.
                            statuses={[]}
                            onStatusChange={() => { }}
                            onExport={handleExport}
                        />
                    </div>
                </div>

                <div className="p-0 m-0 flex-1 overflow-x-auto">
                    <Table className="min-w-[900px]">
                        <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead className="w-[300px]">Proje Adı</TableHead>
                                <TableHead>Müşteri</TableHead>
                                <TableHead>Yönetici</TableHead>
                                <TableHead>İlerleme</TableHead>
                                <TableHead>Teslim Tarihi</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead className="text-right">İşlem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-48 text-center text-muted-foreground p-0">
                                        <TableSkeleton columns={8} rows={5} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredProjects.length > 0 ? (
                                filteredProjects.map((prj: any) => (
                                    <TableRow key={prj.id} className="group hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">{prj.id?.substring(0, 8) || "N/A"}</TableCell>
                                        <TableCell className="font-medium text-primary cursor-pointer hover:underline">
                                            {prj.name}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">{prj.customerName || "Bilinmeyen Müşteri"}</TableCell>
                                        <TableCell className="text-sm group-hover:text-foreground/80 transition-colors">{prj.manager || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 w-full max-w-[150px]">
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>{prj.tasks?.filter((t: any) => t.status === "Done").length || 0} / {prj.tasks?.length || 0} Görev</span>
                                                    <span>%{prj.progress || 0}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                                                    <div
                                                        className={`h-full transition-all duration-500 ease-out ${(prj.progress || 0) === 100 ? 'bg-green-500' : 'bg-primary'}`}
                                                        style={{ width: `${prj.progress || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">{new Date(prj.startDate).toLocaleDateString('tr-TR')}</TableCell>
                                        <TableCell>{getStatusBadge(prj.status)}</TableCell>
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
                                                    <DropdownMenuItem onClick={() => updateProjectStatus(prj.id, "Devam Ediyor")}>Devam Ediyor İşaretle</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateProjectStatus(prj.id, "Tamamlandı")}>Tamamlandı İşaretle</DropdownMenuItem>
                                                    <DropdownMenuItem>Görev (Task) Ekle</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:bg-destructive/10 cursor-pointer"
                                                        onClick={() => {
                                                            setProjectToDelete(prj.id)
                                                            setIsDeleteDialogOpen(true)
                                                        }}
                                                    >
                                                        Projeyi Sil
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-500">
                                            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center ring-4 ring-background">
                                                <Briefcase className="h-6 w-6 text-muted-foreground/60" />
                                            </div>
                                            <p className="font-medium">Proje Bulunamadı</p>
                                            <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
                                                Seçili sekmeye veya arama kriterinize uygun herhangi bir proje kaydı bulunmamaktadır.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Projeyi Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Proje, projedeki görevler ve bağlantılı alt dosyalar tamamen sistemden silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Projeyi Sil</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageWrapper>
    )
}
