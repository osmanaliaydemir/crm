"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PageWrapper } from "@/components/page-wrapper"
import { MeshGradient } from "@/components/mesh-gradient"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    CalendarDays,
    Banknote,
    BellRing,
    CalendarCheck,
    Clock,
    FileText,
    Send,
    Download,
    Receipt,
    Wallet
} from "lucide-react"

import { useAuthStore } from "@/store/authStore"
import { useActiveAnnouncements } from "@/lib/hooks/useAnnouncementQueries"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { LeaveType } from "@/store/leaveStore"
import { ExpenseCategory } from "@/store/expenseStore"
import { useMyLeaves, useCreateLeave, useMyExpenses, useCreateExpense } from "@/hooks/api/use-hr"
import { Badge } from "@/components/ui/badge"

const employeeKpis = [
    {
        title: "Kalan Yıllık İzin",
        value: "14 Gün",
        description: "Bu yılki hakedişiniz",
        icon: CalendarCheck,
        color: "text-emerald-500",
        trendData: [{ value: 14 }, { value: 14 }, { value: 14 }]
    },
    {
        title: "Kalan Mazeret İzni",
        value: "3 Gün",
        description: "Yenilenme: 1 Ocak",
        icon: Clock,
        color: "text-blue-500",
        trendData: [{ value: 3 }, { value: 3 }, { value: 3 }]
    },
    {
        title: "Son Maaş Ödemesi",
        value: "₺42,500",
        description: "Yatırılma: 05 Şubat",
        icon: Banknote,
        color: "text-purple-500",
        trendData: [{ value: 40000 }, { value: 42500 }, { value: 42500 }]
    },
    {
        title: "Toplam Avans",
        value: "₺0",
        description: "Bekleyen borcunuz yok",
        icon: FileText,
        color: "text-rose-500",
        trendData: [{ value: 0 }, { value: 0 }, { value: 0 }]
    },
]



export default function EmployeePortalPage() {
    const { user } = useAuthStore()
    const { data: announcements = [] } = useActiveAnnouncements()

    const formatTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: tr })
        } catch {
            return dateStr
        }
    }

    // API Hooks
    const { data: myLeaves = [], isLoading: isLoadingLeaves } = useMyLeaves()
    const { mutate: addLeaveRequest, isPending: isAddingLeave } = useCreateLeave()
    const { data: myExpenses = [], isLoading: isLoadingExpenses } = useMyExpenses()
    const { mutate: addExpense, isPending: isAddingExpense } = useCreateExpense()

    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)

    // Form States
    const [leaveFormData, setLeaveFormData] = useState({
        type: "Yıllık İzin" as LeaveType,
        startDate: "",
        endDate: "",
        reason: ""
    })

    const [expenseFormData, setExpenseFormData] = useState({
        category: "Yemek" as ExpenseCategory,
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
    })

    const handleLeaveSubmit = () => {
        if (!leaveFormData.startDate || !leaveFormData.endDate) {
            toast.error("Lütfen tarih aralığını seçin.")
            return;
        }

        addLeaveRequest({
            userId: user?.id,
            type: leaveFormData.type,
            startDate: leaveFormData.startDate,
            endDate: leaveFormData.endDate,
            reason: leaveFormData.reason
        }, {
            onSuccess: () => {
                setIsLeaveDialogOpen(false)
                setLeaveFormData({ type: "Yıllık İzin", startDate: "", endDate: "", reason: "" })
            }
        })
    }

    const handleExpenseSubmit = () => {
        if (!expenseFormData.amount || !expenseFormData.description) {
            toast.error("Lütfen tutar ve açıklama alanlarını doldurun.")
            return;
        }

        addExpense({
            userId: user?.id,
            category: expenseFormData.category,
            amount: parseFloat(expenseFormData.amount),
            description: expenseFormData.description,
            date: expenseFormData.date
        }, {
            onSuccess: () => {
                setIsExpenseDialogOpen(false)
                setExpenseFormData({ category: "Yemek", amount: "", description: "", date: new Date().toISOString().split('T')[0] })
            }
        })
    }

    return (
        <PageWrapper className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">
            <MeshGradient />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Personel Portalı</h1>
                    <p className="text-muted-foreground mt-1">Hoş geldiniz, {user?.name}. Self-servis işlemleriniz burada.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-md">
                        <FileText className="h-4 w-4" />
                        Kurum İçi Yönetmelik
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {employeeKpis.map((kpi, index) => (
                    <KpiCard
                        key={kpi.title}
                        {...kpi}
                        delay={index * 0.1}
                    />
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="leave" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px] h-10 bg-muted/50 border border-sidebar-border/30">
                            <TabsTrigger value="leave">İzin Talepleri</TabsTrigger>
                            <TabsTrigger value="expense">Masraf Talepleri</TabsTrigger>
                        </TabsList>

                        <TabsContent value="leave" className="mt-6">
                            <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>İzin İşlemlerim</CardTitle>
                                        <CardDescription>Mevcut talepleriniz ve yeni izin başvuruları.</CardDescription>
                                    </div>
                                    <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="gap-2 shadow-lg shadow-primary/20">
                                                <Send className="h-4 w-4" />
                                                Yeni Talep Oluştur
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>İzin Talebi Oluştur</DialogTitle>
                                                <DialogDescription>
                                                    İzin türünü ve tarih aralığını seçerek onay sürecini başlatın.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="leave-type">İzin Türü</Label>
                                                    <Select
                                                        value={leaveFormData.type}
                                                        onValueChange={(val) => setLeaveFormData({ ...leaveFormData, type: val as LeaveType })}
                                                    >
                                                        <SelectTrigger id="leave-type">
                                                            <SelectValue placeholder="İzin türü seçin" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Yıllık İzin">Yıllık İzin (Ücretli)</SelectItem>
                                                            <SelectItem value="Mazeret İzni">Mazeret İzni</SelectItem>
                                                            <SelectItem value="Hastalık İzni">Hastalık / Rapor</SelectItem>
                                                            <SelectItem value="Ücretsiz İzin">Ücretsiz İzin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="start-date">Başlangıç Tarihi</Label>
                                                        <Input
                                                            id="start-date"
                                                            type="date"
                                                            value={leaveFormData.startDate}
                                                            onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="end-date">Bitiş Tarihi</Label>
                                                        <Input
                                                            id="end-date"
                                                            type="date"
                                                            value={leaveFormData.endDate}
                                                            onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="reason">Açıklama / Neden</Label>
                                                    <Textarea
                                                        id="reason"
                                                        placeholder="Örn: Ailevi nedenler, seyahat vb."
                                                        className="resize-none"
                                                        rows={3}
                                                        value={leaveFormData.reason}
                                                        onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>İptal</Button>
                                                <Button onClick={handleLeaveSubmit} disabled={isAddingLeave} className="bg-primary shadow-lg shadow-primary/20">{isAddingLeave ? "Gönderiliyor..." : "Talebi Gönder"}</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingLeaves ? (
                                        <div className="flex justify-center items-center py-12">Yükleniyor...</div>
                                    ) : myLeaves.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                                <CalendarDays className="h-8 w-8 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">Henüz Bir Talebiniz Yok</h3>
                                            <p className="text-muted-foreground max-w-sm">İzin başvurularınız burada listelenecektir.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {myLeaves.map((leave: any) => {
                                                const start = new Date(leave.startDate)
                                                const end = new Date(leave.endDate)
                                                const diffTime = Math.abs(end.getTime() - start.getTime())
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
                                                const formattedStart = start.toLocaleDateString("tr-TR")
                                                const formattedEnd = end.toLocaleDateString("tr-TR")
                                                const appliedAtStr = leave.createdAt ? new Date(leave.createdAt).toLocaleDateString("tr-TR") : "Belirtilmemiş"

                                                return (
                                                    <div key={leave.id} className="flex items-center justify-between p-4 rounded-xl border bg-background/50 backdrop-blur-sm">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-lg ${leave.status === 'Onaylandı' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                leave.status === 'Reddedildi' ? 'bg-red-500/10 text-red-500' :
                                                                    'bg-amber-500/10 text-amber-500'
                                                                }`}>
                                                                <CalendarDays className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-sm">{leave.type} ({diffDays} Gün)</p>
                                                                <p className="text-xs text-muted-foreground italic truncate max-w-[200px]">{leave.reason || 'Açıklama yok'}</p>
                                                                <p className="text-[10px] text-muted-foreground mt-1">{formattedStart} - {formattedEnd}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {leave.status === 'Bekliyor' && <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Beklemede</Badge>}
                                                            {leave.status === 'Onaylandı' && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Onaylandı</Badge>}
                                                            {leave.status === 'Reddedildi' && <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">Reddedildi</Badge>}
                                                            <span className="text-[9px] text-muted-foreground">{appliedAtStr}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="expense" className="mt-6">
                            <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Masraf Yönetimi</CardTitle>
                                        <CardDescription>Yaptığınız harcamaları sisteme girerek geri ödeme talep edin.</CardDescription>
                                    </div>
                                    <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="gap-2 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700">
                                                <Wallet className="h-4 w-4" />
                                                Yeni Masraf Girişi
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Yeni Masraf Talebi</DialogTitle>
                                                <DialogDescription>Harvamanıza ait bilgileri ve fiş tarihini girin.</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="exp-category">Kategori</Label>
                                                        <Select
                                                            value={expenseFormData.category}
                                                            onValueChange={(val) => setExpenseFormData({ ...expenseFormData, category: val as ExpenseCategory })}
                                                        >
                                                            <SelectTrigger id="exp-category">
                                                                <SelectValue placeholder="Kategori" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Yemek">Yemek</SelectItem>
                                                                <SelectItem value="Yol / Ulaşım">Yol / Ulaşım</SelectItem>
                                                                <SelectItem value="Konaklama">Konaklama</SelectItem>
                                                                <SelectItem value="Yazılım / Servis">Yazılım / Servis</SelectItem>
                                                                <SelectItem value="Diğer">Diğer</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="exp-amount">Tutar (TRY)</Label>
                                                        <Input
                                                            id="exp-amount"
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={expenseFormData.amount}
                                                            onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="exp-date">Harcama Tarihi</Label>
                                                    <Input
                                                        id="exp-date"
                                                        type="date"
                                                        value={expenseFormData.date}
                                                        onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="exp-desc">Açıklama</Label>
                                                    <Textarea
                                                        id="exp-desc"
                                                        placeholder="Harcama detayını yazın..."
                                                        className="resize-none"
                                                        rows={3}
                                                        value={expenseFormData.description}
                                                        onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>İptal</Button>
                                                <Button onClick={handleExpenseSubmit} disabled={isAddingExpense} className="bg-emerald-600 hover:bg-emerald-700">{isAddingExpense ? "Gönderiliyor..." : "Talebi Gönder"}</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingExpenses ? (
                                        <div className="flex justify-center items-center py-12">Yükleniyor...</div>
                                    ) : myExpenses.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
                                            <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                                <Receipt className="h-8 w-8 text-emerald-500" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">Masraf Kaydınız Yok</h3>
                                            <p className="text-muted-foreground max-w-sm">Henüz bir harcama talebi oluşturmadınız.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {myExpenses.map((exp: any) => {
                                                const formattedDate = exp.date ? new Date(exp.date).toLocaleDateString("tr-TR") : "Belirtilmemiş"

                                                return (
                                                    <div key={exp.id} className="flex items-center justify-between p-4 rounded-xl border bg-background/50">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                                                <Receipt className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-sm">{exp.category} - ₺{(exp.amount || 0).toLocaleString()}</p>
                                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{exp.description}</p>
                                                                <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1.5">
                                                            {exp.status === 'Bekliyor' && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Beklemede</Badge>}
                                                            {exp.status === 'Onaylandı' && <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Onaylandı</Badge>}
                                                            {exp.status === 'Ödendi' && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Ödendi</Badge>}
                                                            {exp.status === 'Reddedildi' && <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">Reddedildi</Badge>}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BellRing className="h-5 w-5 text-amber-500" />
                                Şirket Duyuruları
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4">
                            <div className="space-y-4">
                                {announcements.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground text-sm">
                                        <BellRing className="h-6 w-6 mx-auto mb-2 opacity-20" />
                                        Yayında olan bir duyuru bulunmuyor.
                                    </div>
                                ) : (
                                    announcements.map((ann: any) => (
                                        <div key={ann.id} className="flex flex-col gap-1 pb-4 border-b last:border-0 last:pb-0">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${ann.typeName === 'Acil' ? 'text-red-500' :
                                                ann.typeName === 'Finans' ? 'text-emerald-500' :
                                                    ann.typeName === 'Sistem' ? 'text-blue-500' :
                                                        'text-primary'
                                                }`}>
                                                {ann.typeName}
                                            </span>
                                            <span className="font-semibold leading-tight text-sm">
                                                {ann.title}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground mt-0.5 whitespace-pre-wrap">
                                                {ann.content}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/60 mt-1">{formatTime(ann.createdAt)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageWrapper>
    )
}
