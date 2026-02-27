"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Search,
    Filter,
    Download,
    Activity,
    ShieldAlert,
    User,
    Settings,
    CreditCard,
    Briefcase,
    Calendar,
    ChevronDown,
    RefreshCw
} from "lucide-react"

import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
import { useAuditLogs } from "@/hooks/api/use-audit-logs"
import { Skeleton } from "@/components/ui/skeleton"

export default function AuditLogsPage() {
    const { data: logs = [], isLoading, refetch } = useAuditLogs()
    const [searchTerm, setSearchTerm] = useState("")
    const [moduleFilter, setModuleFilter] = useState("all")
    const [severityFilter, setSeverityFilter] = useState("all")

    // Backend verilerini UI formatına map et
    const mappedLogs = logs.map(log => {
        // Basit bir severity tahmini (UI için)
        let severity: "low" | "medium" | "high" | "critical" = "low";
        const actionLower = log.action.toLowerCase();

        if (actionLower.includes("sil") || actionLower.includes("delete")) severity = "high";
        else if (actionLower.includes("hata") || actionLower.includes("fail") || actionLower.includes("deneme")) severity = "medium";
        else if (actionLower.includes("yetki") || actionLower.includes("role") || actionLower.includes("permission")) severity = "critical";

        // Modül mapping
        let module: string = log.entityName || "Sistem";
        if (module.includes("User") || module.includes("Account")) module = "Kullanıcı Yönetimi";
        else if (module.includes("Finance") || module.includes("Transaction") || module.includes("Invoice")) module = "Finans";
        else if (module.includes("Deal") || module.includes("Lead")) module = "Satış";
        else if (module.includes("Employee") || module.includes("Leave")) module = "İnsan Kaynakları";

        return {
            id: log.id,
            timestamp: new Date(log.timestamp).toLocaleString("tr-TR"),
            user: log.userEmail || "Bilinmeyen Kullanıcı",
            action: log.action,
            module: module as any,
            severity: severity,
            details: log.newValues || log.action,
            ipAddress: log.ipAddress || "0.0.0.0"
        }
    })

    const filteredLogs = mappedLogs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesModule = moduleFilter === "all" || log.module === moduleFilter;
        const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;

        return matchesSearch && matchesModule && matchesSeverity;
    })

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case "low": return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 shadow-none border-blue-500/20">Bilgi</Badge>
            case "medium": return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-none border-amber-500/20">Uyarı</Badge>
            case "high": return <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 shadow-none border-orange-500/20">Önemli</Badge>
            case "critical": return <Badge variant="destructive" className="shadow-none inline-flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Kritik</Badge>
            default: return <Badge variant="outline">Bilinmeyen</Badge>
        }
    }

    const getModuleIcon = (module: string) => {
        switch (module) {
            case "Sistem": return <Settings className="h-4 w-4 text-muted-foreground" />
            case "Kullanıcı Yönetimi": return <User className="h-4 w-4 text-muted-foreground" />
            case "Finans": return <CreditCard className="h-4 w-4 text-muted-foreground" />
            case "Satış": return <Briefcase className="h-4 w-4 text-muted-foreground" />
            case "İnsan Kaynakları": return <Calendar className="h-4 w-4 text-muted-foreground" />
            default: return <Activity className="h-4 w-4 text-muted-foreground" />
        }
    }

    return (
        <PageWrapper className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Activity className="h-8 w-8 text-primary" /> İşlem Denetim Kayıtları (Audit Trail)
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm max-w-3xl">
                        Sistemdeki tüm konfigürasyon değişiklikleri, kullanıcı girişleri, veri silme işlemleri ve diğer kritik olaylar güvenlik standartları gereği burada geriye dönük olarak kayıt altına alınır.
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="w-full md:w-auto shadow-sm" onClick={() => refetch()} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Yenile
                    </Button>
                    <Button className="w-full md:w-auto shadow-sm">
                        <Download className="h-4 w-4 mr-2" /> .CSV İndir
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-muted/60 overflow-hidden">
                <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="İşlem adı, kullanıcı veya detay ara..."
                            className="pl-9 bg-background shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Select value={moduleFilter} onValueChange={setModuleFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-background shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 opacity-50" />
                                    <SelectValue placeholder="Modül Filtresi" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Modüller</SelectItem>
                                <SelectItem value="Sistem">Sistem</SelectItem>
                                <SelectItem value="Kullanıcı Yönetimi">Kullanıcı Yönetimi</SelectItem>
                                <SelectItem value="Satış">Satış</SelectItem>
                                <SelectItem value="Finans">Finans</SelectItem>
                                <SelectItem value="İnsan Kaynakları">İnsan Kaynakları</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="w-full sm:w-[150px] bg-background shadow-sm">
                                <SelectValue placeholder="Önem Derecesi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Seviyeler</SelectItem>
                                <SelectItem value="critical">Kritik</SelectItem>
                                <SelectItem value="high">Önemli</SelectItem>
                                <SelectItem value="medium">Uyarı</SelectItem>
                                <SelectItem value="low">Bilgi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-[180px] pl-6">Zaman Damgası</TableHead>
                                    <TableHead>Kullanıcı / Aktör</TableHead>
                                    <TableHead>İşlem & Modül</TableHead>
                                    <TableHead className="w-[80px] text-center">Seviye</TableHead>
                                    <TableHead className="max-w-[300px]">Detaylar</TableHead>
                                    <TableHead className="text-right pr-6">IP Adresi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="pl-6"><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                            <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-60" /></TableCell>
                                            <TableCell className="text-right pr-6"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredLogs.length > 0 ? (
                                    filteredLogs.map((log, index) => (
                                        <motion.tr
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={log.id}
                                            className="group hover:bg-muted/30 transition-colors border-b last:border-0"
                                        >
                                            <TableCell className="pl-6 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{log.timestamp.split(" ")[0]}</span>
                                                    <span className="text-xs text-muted-foreground">{log.timestamp.split(" ")[1]}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{log.user}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-sm">{log.action}</span>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        {getModuleIcon(log.module)}
                                                        {log.module}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getSeverityBadge(log.severity)}
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                <p className="text-sm truncate text-muted-foreground group-hover:text-foreground transition-colors" title={log.details}>
                                                    {log.details}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 font-mono text-xs text-muted-foreground">
                                                {log.ipAddress}
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <Activity className="h-8 w-8 opacity-20" />
                                                <p>Filtreye uygun log kaydı bulunamadı.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </PageWrapper>
    )
}
