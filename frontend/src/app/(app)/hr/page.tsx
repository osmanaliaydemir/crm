"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PageWrapper } from "@/components/page-wrapper"
import { MeshGradient } from "@/components/mesh-gradient"
import { KpiCard } from "@/components/kpi-card"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
    useAllAnnouncements,
    useCreateAnnouncement,
    useDeleteAnnouncement,
    useToggleAnnouncementStatus
} from "@/lib/hooks/useAnnouncementQueries"
import { useLeaveStore, LeaveStatus, LeaveType as LeaveRequestType } from "@/store/leaveStore"
import { useExpenses, useUpdateExpenseStatus, useLeaves, useUpdateLeaveStatus, usePayrolls, useUpdatePayrollStatus, usePerformanceEvaluations } from "@/hooks/api/use-hr"
import { useUsers } from "@/hooks/api/use-users"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { TableSkeleton } from "@/components/skeletons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    Users,
    UserPlus,
    CalendarOff,
    TrendingUp,
    MoreHorizontal,
    Mail,
    Phone,
    ShieldCheck,
    Search,
    Download,
    Megaphone,
    Trash2,
    Plus,
    CheckCircle2,
    XCircle,
    Check,
    X,
    Clock,
    Receipt,
    Wallet,
    DollarSign,
    ChevronRight,
    GitGraph,
    Network,
    Star,
    Target,
    UserCircle,
    Building2
} from "lucide-react"

// --- Mock Data ---

// KPI Verileri (Dinamikleştirilecek olanlar)
const getHrKpis = (empCount: number, leaveCount: number, performanceAvg: number) => [
    {
        title: "Toplam Personel",
        value: empCount.toString(),
        description: "Aktif çalışan sayısı",
        icon: Users,
        color: "text-blue-500",
        trendData: [{ value: 118 }, { value: 120 }, { value: 121 }, { value: 121 }, { value: 121 }, { value: empCount }]
    },
    {
        title: "İzindeki Personel",
        value: leaveCount.toString(),
        description: "Şu an izinde olanlar",
        icon: CalendarOff,
        color: "text-emerald-500",
        trendData: [{ value: 12 }, { value: 15 }, { value: 10 }, { value: 14 }, { value: 10 }, { value: leaveCount }]
    },
    {
        title: "Açık Pozisyonlar",
        value: "5",
        description: "+1 geçen aya göre",
        icon: UserPlus,
        color: "text-purple-500",
        trendData: [{ value: 2 }, { value: 3 }, { value: 4 }, { value: 4 }, { value: 4 }, { value: 5 }]
    },
    {
        title: "Ort. Performans Puanı",
        value: performanceAvg.toFixed(1),
        description: "Genel yetkinlik skoru",
        icon: TrendingUp,
        color: "text-orange-500",
        trendData: [{ value: 8.0 }, { value: 8.1 }, { value: 8.2 }, { value: 8.1 }, { value: 8.2 }, { value: performanceAvg }]
    },
]

type Employee = {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    status: "active" | "on_leave" | "probation";
    phone: string;
    avatar?: string;
}

const initialEmployees: Employee[] = [
    { id: "EMP-001", name: "Ayşe Yılmaz", email: "ayse.yilmaz@universal.com", department: "Satış", role: "Kıdemli Uzman", status: "active", phone: "+90 532 111 2233" },
    { id: "EMP-002", name: "Mehmet Demir", email: "mehmet.demir@universal.com", department: "IT & Yazılım", role: "Backend Geliştirici", status: "active", phone: "+90 533 222 3344" },
    { id: "EMP-003", name: "Zeynep Kaya", email: "zeynep.kaya@universal.com", department: "İnsan Kaynakları", role: "İK Yöneticisi", status: "active", phone: "+90 555 333 4455" },
    { id: "EMP-004", name: "Caner Şahin", email: "caner.sahin@universal.com", department: "Finans", role: "Muhasebe Uzmanı", status: "on_leave", phone: "+90 544 444 5566" },
    { id: "EMP-005", name: "Elif Öztürk", email: "elif.ozturk@universal.com", department: "Pazarlama", role: "Junior SEO Uzmanı", status: "probation", phone: "+90 530 555 6677" },
    { id: "EMP-006", name: "Burak Çelik", email: "burak.celik@universal.com", department: "Satış", role: "Satış Destek Elemanı", status: "active", phone: "+90 532 666 7788" },
]

export default function HRPage() {
    const [searchTerm, setSearchTerm] = useState("")

    const formatTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: tr })
        } catch {
            return dateStr
        }
    }

    // Announcement API Hooks
    const { data: announcements = [] } = useAllAnnouncements()
    const { mutate: addAnnouncement } = useCreateAnnouncement()
    const { mutate: deleteAnnouncement } = useDeleteAnnouncement()
    const { mutate: toggleAnnouncementStatus } = useToggleAnnouncementStatus()

    const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false)
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: "",
        content: "",
        type: "Genel" as string
    })

    // --- API Hookları ---
    const { data: employeesData = [], isLoading: isLoadingUsers } = useUsers()
    const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaves()
    const { data: payrolls = [], isLoading: isLoadingPayrolls } = usePayrolls()
    const { data: evaluations = [], isLoading: isLoadingEvals } = usePerformanceEvaluations()
    const { data: expenses = [], isLoading: isLoadingExpenses } = useExpenses()

    const { mutate: updateLeaveStatus } = useUpdateLeaveStatus()
    const { mutate: updateExpenseStatus } = useUpdateExpenseStatus()
    const { mutate: updatePayrollStatus } = useUpdatePayrollStatus()

    // Employee Form State
    const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
    const [newEmployeeData, setNewEmployeeData] = useState<Omit<Employee, 'id'>>({
        name: "",
        email: "",
        phone: "",
        department: "Satış",
        role: "",
        status: "active"
    })

    const employees = employeesData.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        department: u.department || "Departman Belirtilmedi",
        role: u.role || "Çalışan",
        status: (u.status || "active") as any,
        phone: u.phoneNumber || ""
    }))

    const hrKpis = getHrKpis(
        employees.length,
        leaves.filter((l: any) => l.status === "Onaylandı").length,
        evaluations.length > 0 ? evaluations.reduce((acc: number, cur: any) => acc + cur.score, 0) / evaluations.length : 8.5
    )

    const handleCreateEmployee = () => {
        if (!newEmployeeData.name || !newEmployeeData.email) {
            toast.error("Lütfen ad ve e-posta alanlarını doldurun.")
            return;
        }

        // TODO: Implement create employee mutation
        toast.info("Yeni personel kaydı API üzerinden oluşturulmalıdır.", {
            description: "Bu işlem şimdilik simüle edildi. Kullanıcı yönetimi modülünü kullanın."
        })
        setIsEmployeeDialogOpen(false)
        setNewEmployeeData({
            name: "",
            email: "",
            phone: "",
            department: "Satış",
            role: "",
            status: "active"
        })
    }

    const handleCreateAnnouncement = () => {
        if (!newAnnouncement.title || !newAnnouncement.content) {
            toast.error("Lütfen başlık ve içerik alanlarını doldurun.")
            return;
        }

        addAnnouncement(newAnnouncement, {
            onSuccess: () => {
                setNewAnnouncement({ title: "", content: "", type: "Genel" })
                setIsAnnouncementDialogOpen(false)
                toast.success("Duyuru başarıyla yayınlandı!")
            }
        })
    }

    const filteredEmployees = employees.filter((emp: any) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status: Employee['status']) => {
        switch (status) {
            case "active":
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Aktif</Badge>
            case "on_leave":
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">İzinde</Badge>
            case "probation":
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Deneme Süresi</Badge>
        }
    }

    return (
        <PageWrapper className="flex flex-col gap-6 pb-10 w-full min-w-0 max-w-full overflow-x-hidden">
            <MeshGradient />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">İnsan Kaynakları</h1>
                    <p className="text-muted-foreground mt-1">Personel, İzin ve Performans Yönetimi Merkezi</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-md">
                        <Download className="h-4 w-4" />
                        Rapor İndir
                    </Button>
                    <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <UserPlus className="h-4 w-4" />
                                Yeni Personel
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                            <DialogHeader>
                                <DialogTitle>Yeni Personel Kaydı</DialogTitle>
                                <DialogDescription>
                                    Kurumsal sisteme yeni bir çalışma arkadaşı eklemek için bilgileri doldurun.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="emp-name">Ad Soyad</Label>
                                        <Input
                                            id="emp-name"
                                            placeholder="Örn: Ayşe Yılmaz"
                                            value={newEmployeeData.name}
                                            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emp-email">E-posta Adresi</Label>
                                        <Input
                                            id="emp-email"
                                            type="email"
                                            placeholder="ayse@firma.com"
                                            value={newEmployeeData.email}
                                            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="emp-phone">Telefon Numarası</Label>
                                        <Input
                                            id="emp-phone"
                                            placeholder="+90 5xx ..."
                                            value={newEmployeeData.phone}
                                            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emp-dept">Departman</Label>
                                        <Select
                                            value={newEmployeeData.department}
                                            onValueChange={(val) => setNewEmployeeData({ ...newEmployeeData, department: val })}
                                        >
                                            <SelectTrigger id="emp-dept">
                                                <SelectValue placeholder="Departman Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Satış">Satış</SelectItem>
                                                <SelectItem value="IT & Yazılım">IT & Yazılım</SelectItem>
                                                <SelectItem value="İnsan Kaynakları">İnsan Kaynakları</SelectItem>
                                                <SelectItem value="Finans">Finans</SelectItem>
                                                <SelectItem value="Pazarlama">Pazarlama</SelectItem>
                                                <SelectItem value="Operasyon">Operasyon</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="emp-role">Unvan / Görev</Label>
                                        <Input
                                            id="emp-role"
                                            placeholder="Kıdemli Uzman"
                                            value={newEmployeeData.role}
                                            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, role: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emp-status">Çalışma Durumu</Label>
                                        <Select
                                            value={newEmployeeData.status}
                                            onValueChange={(val) => setNewEmployeeData({ ...newEmployeeData, status: val as Employee['status'] })}
                                        >
                                            <SelectTrigger id="emp-status">
                                                <SelectValue placeholder="Durum Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Aktif</SelectItem>
                                                <SelectItem value="probation">Deneme Süresi</SelectItem>
                                                <SelectItem value="on_leave">İzinde</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEmployeeDialogOpen(false)}>İptal</Button>
                                <Button onClick={handleCreateEmployee} className="gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Kaydı Tamamla
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {hrKpis.map((kpi, index) => (
                    <KpiCard
                        key={kpi.title}
                        {...kpi}
                        delay={index * 0.1}
                    />
                ))}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="employees" className="w-full max-w-full">
                <TabsList className="grid w-full grid-cols-7 max-w-4xl h-10 bg-muted/50 border border-sidebar-border/30">
                    <TabsTrigger value="employees">Personel Listesi</TabsTrigger>
                    <TabsTrigger value="leaves" className="gap-2">İzin Takibi</TabsTrigger>
                    <TabsTrigger value="expenses" className="gap-2">Masraf Yönetimi</TabsTrigger>
                    <TabsTrigger value="payrolls">Bordro</TabsTrigger>
                    <TabsTrigger value="org-chart" className="gap-2">Org. Şeması</TabsTrigger>
                    <TabsTrigger value="performance">Performans</TabsTrigger>
                    <TabsTrigger value="announcements">Duyurular</TabsTrigger>
                </TabsList>

                {/* Employees Tab */}
                <TabsContent value="employees" className="mt-6 w-full min-w-0">
                    <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50 shadow-sm w-full overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
                            <div>
                                <CardTitle className="text-lg">Tüm Çalışanlar</CardTitle>
                                <p className="text-sm text-muted-foreground">Aktif, izinde ve deneme süresindeki personel listesi.</p>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="İsim veya departman ara..."
                                    className="pl-9 bg-background/50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="pl-6 w-[250px]">Personel</TableHead>
                                        <TableHead>Departman</TableHead>
                                        <TableHead>Görev</TableHead>
                                        <TableHead>Durum</TableHead>
                                        <TableHead className="text-right pr-6">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Arama kriterlerine uygun personel bulunamadı.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEmployees.map((emp) => (
                                            <TableRow key={emp.id} className="hover:bg-muted/30 cursor-pointer transition-colors">
                                                <TableCell className="pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-sidebar-border shadow-sm">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}`} />
                                                            <AvatarFallback>{emp.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">{emp.name}</span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Mail className="h-3 w-3" /> {emp.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{emp.department}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-medium">{emp.role}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(emp.status)}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="cursor-pointer">Profili Görüntüle</DropdownMenuItem>
                                                            <DropdownMenuItem className="cursor-pointer">İzin Tanımla</DropdownMenuItem>
                                                            <DropdownMenuItem className="cursor-pointer">Performans Notu Ekle</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">Çıkış İşlemi Başlat</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Leaves Tab */}
                <TabsContent value="leaves" className="mt-6 w-full min-w-0">
                    <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50 shadow-sm w-full overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-amber-500" />
                                    İzin Talepleri ve Onaylar
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Personellerin yıllık ve özel izin taleplerini buradan yönetin.</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="w-full min-w-[800px]">
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="pl-6">Personel</TableHead>
                                            <TableHead>İzin Tipi</TableHead>
                                            <TableHead>Tarih Aralığı</TableHead>
                                            <TableHead>Durum</TableHead>
                                            <TableHead className="text-right pr-6">İşlemler</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingLeaves ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-10"><TableSkeleton /></TableCell></TableRow>
                                        ) : (leaves?.length || 0) === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">İzin talebi bulunmuyor.</TableCell></TableRow>
                                        ) : (
                                            leaves.map((leave: any) => (
                                                <TableRow key={leave.id}>
                                                    <TableCell className="pl-6 font-medium">{leave.employeeName}</TableCell>
                                                    <TableCell>{leave.leaveType}</TableCell>
                                                    <TableCell className="text-xs">
                                                        {new Date(leave.startDate).toLocaleDateString("tr-TR")} - {new Date(leave.endDate).toLocaleDateString("tr-TR")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={leave.status === "Onaylandı" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}>
                                                            {leave.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        {leave.status === "Bekliyor" && (
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => updateLeaveStatus({ id: leave.id, status: "Reddedildi" })}><X className="h-4 w-4" /></Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => updateLeaveStatus({ id: leave.id, status: "Onaylandı" })}><Check className="h-4 w-4" /></Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Expenses Tab */}
                <TabsContent value="expenses" className="mt-6 w-full min-w-0">
                    <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50 shadow-sm w-full overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-emerald-500" />
                                    Harcama ve Masraf Onayları
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Personel harcamalarını inceleyin ve ödeme sürecini yönetin.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3">
                                    {expenses.filter((e: any) => e.status === "Bekliyor").length} Bekliyor
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-hidden w-full">
                            <div className="overflow-x-auto w-full">
                                <Table className="w-full table-fixed min-w-[1000px]">
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="pl-6 w-[200px]">Personel</TableHead>
                                            <TableHead className="w-[140px]">Kategori</TableHead>
                                            <TableHead className="w-[120px]">Tutar</TableHead>
                                            <TableHead className="w-[180px]">Harcama Tarihi</TableHead>
                                            <TableHead className="w-[100px] text-center">Durum</TableHead>
                                            <TableHead className="text-right pr-6 w-[180px]">İşlemler</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingExpenses ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground p-0">
                                                    <TableSkeleton />
                                                </TableCell>
                                            </TableRow>
                                        ) : expenses.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                    Kayıtlı masraf talebi bulunmuyor.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            expenses.map((exp: any) => {
                                                const formattedDate = exp.date ? new Date(exp.date).toLocaleDateString("tr-TR") : "Belirtilmemiş"

                                                return (
                                                    <TableRow key={exp.id} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="pl-6">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${exp.userName}`} />
                                                                    <AvatarFallback>{exp.userName?.substring(0, 2).toUpperCase() || "UN"}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-semibold">{exp.userName}</span>
                                                                    <span className="text-[10px] text-muted-foreground">ID: {exp.id?.substring(0, 8)}</span>
                                                                </div>
                                                            </div >
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="text-[10px] font-medium bg-muted">
                                                                {exp.category}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-bold text-sm">
                                                            ₺{(exp.amount || 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs">{formattedDate}</span>
                                                                <span className="text-[10px] text-muted-foreground truncate" title={exp.description}>
                                                                    {exp.description}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {exp.status === "Bekliyor" && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Beklemede</Badge>}
                                                            {exp.status === "Onaylandı" && <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Onaylandı</Badge>}
                                                            {exp.status === "Ödendi" && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Ödendi</Badge>}
                                                            {exp.status === "Reddedildi" && <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Reddedildi</Badge>}
                                                        </TableCell>
                                                        <TableCell className="text-right pr-6">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {exp.status === "Bekliyor" && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-8 w-8 p-0 text-red-500"
                                                                            onClick={() => updateExpenseStatus({ id: exp.id, status: "Reddedildi" })}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-8 w-8 p-0 text-emerald-500"
                                                                            onClick={() => updateExpenseStatus({ id: exp.id, status: "Onaylandı" })}
                                                                        >
                                                                            <Check className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {exp.status === "Onaylandı" && (
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-700 text-[11px]"
                                                                        onClick={() => {
                                                                            updateExpenseStatus({ id: exp.id, status: "Ödendi" });
                                                                        }}
                                                                    >
                                                                        <DollarSign className="h-3 w-3" />
                                                                        Ödeme Yapıldı
                                                                    </Button>
                                                                )}
                                                                {exp.status === "Ödendi" && (
                                                                    <span className="text-[10px] text-muted-foreground italic">Arşivlendi</span>
                                                                )}
                                                                {exp.status === "Reddedildi" && (
                                                                    <span className="text-[10px] text-red-400 italic">Reddedildi</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payrolls Tab */}
                <TabsContent value="payrolls" className="mt-6 w-full min-w-0">
                    <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50 shadow-sm w-full overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-indigo-500" />
                                    Bordro ve Maaş Yönetimi
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Hak edişleri inceleyin ve ödeme durumlarını güncelleyin.</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="w-full min-w-[800px]">
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="pl-6">Personel</TableHead>
                                            <TableHead>Dönem</TableHead>
                                            <TableHead>Net Maaş</TableHead>
                                            <TableHead>Durum</TableHead>
                                            <TableHead className="text-right pr-6">İşlemler</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingPayrolls ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-10"><TableSkeleton /></TableCell></TableRow>
                                        ) : (payrolls?.length || 0) === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Bordro kaydı bulunmuyor.</TableCell></TableRow>
                                        ) : (
                                            payrolls.map((p: any) => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="pl-6 font-medium">{p.employeeName}</TableCell>
                                                    <TableCell>{p.period}</TableCell>
                                                    <TableCell className="font-bold">₺{p.netSalary.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Badge className={p.status === "Ödendi" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}>
                                                            {p.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        {p.status !== "Ödendi" && (
                                                            <Button size="sm" onClick={() => updatePayrollStatus({ id: p.id, status: "Ödendi", paymentDate: new Date().toISOString() })}>Ödendi İşaretle</Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Org Chart Tab */}
                <TabsContent value="org-chart" className="mt-6 w-full min-w-0">
                    <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50 shadow-sm w-full overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Network className="h-5 w-5 text-indigo-500" />
                                Kurumsal Organizasyon Şeması
                            </CardTitle>
                            <CardDescription>Şirket hiyerarşisini ve departman yapısını görselleştirin.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center gap-12 py-10 overflow-x-auto min-w-[800px]">
                                {/* CEO / Management Level */}
                                <div className="relative">
                                    <div className="bg-primary/10 border-2 border-primary/40 rounded-2xl p-4 w-[240px] text-center shadow-xl shadow-primary/10">
                                        <Avatar className="h-12 w-12 mx-auto mb-2 border-2 border-primary/20">
                                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=CEO" />
                                            <AvatarFallback>CEO</AvatarFallback>
                                        </Avatar>
                                        <h4 className="font-bold text-sm">Caner Uzun</h4>
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-tight">Genel Müdür / CEO</p>
                                    </div>
                                    <div className="absolute top-full left-1/2 w-[2px] h-12 bg-primary/20 -translate-x-1/2" />
                                </div>

                                {/* Departments Level */}
                                <div className="flex gap-12 relative pt-2">
                                    <div className="absolute top-0 left-[10%] right-[10%] h-[2px] bg-primary/20" />

                                    {[
                                        { name: "Satış & Pazarlama", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                                        { name: "Yazılım & IT", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                                        { name: "İK & Finans", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
                                    ].map((dept, i) => (
                                        <div key={i} className="flex flex-col items-center relative gap-8">
                                            <div className="absolute bottom-full left-1/2 w-[2px] h-8 bg-primary/20 -translate-x-1/2" />
                                            <div className={`${dept.bg} ${dept.border} border rounded-xl p-3 w-[180px] text-center`}>
                                                <h5 className={`font-bold text-xs ${dept.color}`}>{dept.name}</h5>
                                            </div>
                                            <div className="absolute top-full left-1/2 w-[2px] h-8 bg-primary/20 -translate-x-1/2" />

                                            {/* Employee Cards per Dept */}
                                            <div className="flex flex-col gap-3 mt-2">
                                                {employees.filter(e => i === 0 ? (e.department === "Satış" || e.department === "Pazarlama") :
                                                    i === 1 ? e.department === "IT" :
                                                        (e.department === "İK" || e.department === "Finans"))
                                                    .slice(0, 3).map((emp) => (
                                                        <div key={emp.id} className="bg-background border rounded-lg p-2.5 w-[160px] flex items-center gap-3 shadow-sm hover:border-primary/30 transition-all cursor-default group">
                                                            <Avatar className="h-7 w-7 ring-2 ring-muted group-hover:ring-primary/20 transition-all">
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}`} />
                                                                <AvatarFallback>{emp.name.substring(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[11px] font-bold truncate">{emp.name}</span>
                                                                <span className="text-[9px] text-muted-foreground truncate">{emp.role}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* Performance Tab */}
                <TabsContent value="performance" className="mt-6 w-full min-w-0">
                    <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50 shadow-sm w-full overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Target className="h-5 w-5 text-rose-500" />
                                    Performans ve Hedef Takibi
                                </CardTitle>
                                <CardDescription>Personel yetkinliklerini ve dönem sonu hedeflerini değerlendirin.</CardDescription>
                            </div>
                            <Button className="gap-2 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20">
                                <Plus className="h-4 w-4" />
                                Yeni Değerlendirme
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="w-full min-w-[800px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">Personel</TableHead>
                                            <TableHead>Son Skor</TableHead>
                                            <TableHead>Hedef Uyumu</TableHead>
                                            <TableHead>Değerlendirme Tarihi</TableHead>
                                            <TableHead className="text-right pr-6">Aksiyon</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingEvals ? (
                                            <TableRow><TableCell colSpan={5} className="text-center"><TableSkeleton /></TableCell></TableRow>
                                        ) : evaluations.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Değerlendirme bulunmuyor.</TableCell></TableRow>
                                        ) : (
                                            evaluations.map((evalItem: any) => (
                                                <TableRow key={evalItem.id} className="group">
                                                    <TableCell className="pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>{evalItem.employeeName.substring(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-semibold">{evalItem.employeeName}</span>
                                                                <span className="text-[10px] text-muted-foreground">Dönem: {evalItem.period}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-3 w-3 ${star <= (evalItem.score / 20) ? 'text-amber-500 fill-amber-500' : 'text-muted'}`}
                                                                />
                                                            ))}
                                                            <span className="ml-2 text-xs font-bold text-amber-600">{(evalItem.score / 20).toFixed(1)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-xs">{evalItem.feedback}</span>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {new Date(evalItem.evaluationDate).toLocaleDateString("tr-TR")}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <Button variant="ghost" size="sm" className="h-8 text-xs">Detaylar</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Announcements Tab */}
                <TabsContent value="announcements" className="mt-6 w-full min-w-0">
                    <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50 shadow-sm w-full overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b w-full overflow-hidden">
                            <div className="min-w-0">
                                <CardTitle className="text-lg flex items-center gap-2 truncate">
                                    <Megaphone className="h-5 w-5 text-primary shrink-0" />
                                    Şirket İçi Duyuru Yönetimi
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1 truncate">Personellerin portallarında görebileceği bildirimleri buradan yönetin.</p>
                            </div>
                            <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2 shadow-lg shadow-primary/20">
                                        <Plus className="h-4 w-4" />
                                        Yeni Duyuru Ekle
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Yeni Şirket Duyurusu</DialogTitle>
                                        <DialogDescription>
                                            Bu duyuru sisteme kayıtlı olan tüm personelin self-servis panelinde görünecektir.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Duyuru Başlığı</Label>
                                            <Input
                                                id="title"
                                                placeholder="Örn: 2026 Yemek Kartı Yüklemeleri"
                                                value={newAnnouncement.title}
                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Kategori</Label>
                                            <Select
                                                value={newAnnouncement.type}
                                                onValueChange={(val) => setNewAnnouncement({ ...newAnnouncement, type: val as string })}
                                            >
                                                <SelectTrigger id="type">
                                                    <SelectValue placeholder="Kategori Seçin" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Genel">Genel Koordinasyon</SelectItem>
                                                    <SelectItem value="Finans">Maaş & Finans</SelectItem>
                                                    <SelectItem value="İdari İşler">İdari İşler</SelectItem>
                                                    <SelectItem value="Sistem">Sistem & IT Bakımı</SelectItem>
                                                    <SelectItem value="Acil">Kritik / Acil Bildiri</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="content">Duyuru İçeriği</Label>
                                            <Textarea
                                                id="content"
                                                placeholder="Duyurunun tam metnini buraya yazın..."
                                                className="resize-none min-h-[120px]"
                                                value={newAnnouncement.content}
                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>Vazgeç</Button>
                                        <Button onClick={handleCreateAnnouncement}>Duyuruyu Yayınla</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="p-0 overflow-hidden w-full">
                            <div className="overflow-x-auto w-full">
                                <Table className="w-full table-fixed min-w-[700px]">
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="pl-6 w-[160px]">Kategori / Tarih</TableHead>
                                            <TableHead className="w-auto">Başlık & Özet</TableHead>
                                            <TableHead className="w-[120px] text-center">Durum</TableHead>
                                            <TableHead className="text-right pr-6 w-[100px]">İşlemler</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {announcements.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                                    <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                                    Henüz yayınlanmış bir şirket duyurusu bulunmuyor.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            announcements.map((ann: any) => (
                                                <TableRow key={ann.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="pl-6 align-top pt-4">
                                                        <div className="flex flex-col gap-1">
                                                            <Badge variant="outline" className={`w-fit font-semibold ${ann.typeName === 'Acil' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                ann.typeName === 'Finans' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                                    ann.typeName === 'Sistem' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                        'bg-primary/10 text-primary border-primary/20'
                                                                }`}>
                                                                {ann.typeName}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground font-medium mt-1">{formatTime(ann.createdAt)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top pt-4 overflow-hidden">
                                                        <div className="flex flex-col gap-1 min-w-0">
                                                            <span className="font-bold text-base leading-tight">{ann.title}</span>
                                                            <p className="text-sm text-muted-foreground mt-1 pr-6 leading-relaxed whitespace-pre-wrap">
                                                                {ann.content}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top pt-4 text-center">
                                                        <div className="flex justify-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleAnnouncementStatus(ann.id)}
                                                                className={`h-8 px-2 w-fit justify-start bg-transparent ${ann.isActive ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                                                                title={ann.isActive ? "Duyuruyu Gizle" : "Duyuruyu Aktif Et"}
                                                            >
                                                                {ann.isActive ? (
                                                                    <><CheckCircle2 className="h-4 w-4 mr-1.5" /> <span className="text-xs">Yayında</span></>
                                                                ) : (
                                                                    <><XCircle className="h-4 w-4 mr-1.5" /> <span className="text-xs">Pasif</span></>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top pt-4 text-right pr-6">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                            onClick={() => {
                                                                if (confirm("Duyuruyu silmek istediğinize emin misiniz?")) {
                                                                    deleteAnnouncement(ann.id);
                                                                    toast.success("Duyuru silindi.");
                                                                }
                                                            }}
                                                            title="Sistemden Tamamen Sil"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </PageWrapper>
    )
}
