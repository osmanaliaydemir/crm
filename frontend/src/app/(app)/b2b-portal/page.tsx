"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { MeshGradient } from "@/components/mesh-gradient"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Package,
    FileText,
    MessageSquare,
    Download,
    CreditCard,
    Truck,
    User,
    Mail,
    Phone
} from "lucide-react"

import { usePortalSummary, usePortalOrders, usePortalInvoices } from "@/hooks/api/use-portal"
import { Skeleton } from "@/components/ui/skeleton"

export default function B2BPortalPage() {
    const { data: summary, isLoading: isSummaryLoading } = usePortalSummary()
    const { data: orders = [], isLoading: isOrdersLoading } = usePortalOrders()
    const { data: invoices = [], isLoading: isInvoicesLoading } = usePortalInvoices()

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount)
    }

    const customerKpis = [
        { title: "Toplam Sipariş", value: orders.length.toString(), icon: Package, color: "text-blue-500", description: "Toplam sipariş adedi", trendData: [{ value: 10 }, { value: 15 }, { value: orders.length }] },
        { title: "Bekleyen Ödeme", value: formatCurrency(summary?.pendingPaymentAmount || 0), icon: CreditCard, color: "text-rose-500", description: "Vadesi gelmiş/yaklaşan", trendData: [{ value: 5 }, { value: 8 }, { value: summary?.pendingPaymentAmount || 0 }] },
        { title: "Toplam Ciro", value: formatCurrency(summary?.totalOrderAmount || 0), icon: Truck, color: "text-emerald-500", description: "Bugüne kadarki toplam", trendData: [{ value: 1 }, { value: 2 }, { value: summary?.totalOrderAmount || 1 }] },
        { title: "Destek Talebi", value: "0", icon: MessageSquare, color: "text-amber-500", description: "Hepsi kapalı", trendData: [{ value: 0 }, { value: 0 }, { value: 0 }] },
    ]

    return (
        <PageWrapper className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
            <MeshGradient />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                        Müşteri Portalı
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Hoş geldiniz. Sipariş ve finansal hareketlerinizi buradan takip edebilirsiniz.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                        <Download className="h-4 w-4" />
                        Hesap Özeti (PDF)
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <MessageSquare className="h-4 w-4" />
                        Temsilciye Yaz
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
                {isSummaryLoading ? (
                    Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
                ) : (
                    customerKpis.map((kpi, i) => (
                        <KpiCard key={i} {...kpi} delay={i * 0.1} />
                    ))
                )}
            </div>

            <div className="grid gap-8 md:grid-cols-3 relative z-10">
                {/* Sol Taraf: Aktif Siparişler ve Faturalar */}
                <div className="md:col-span-2 space-y-8">
                    <Tabs defaultValue="orders" className="w-full">
                        <TabsList className="bg-muted/50 p-1 h-12">
                            <TabsTrigger value="orders" className="gap-2 px-6">
                                <Package className="h-4 w-4" />
                                Siparişlerim
                            </TabsTrigger>
                            <TabsTrigger value="invoices" className="gap-2 px-6">
                                <FileText className="h-4 w-4" />
                                Faturalarım
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="orders" className="mt-6">
                            <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/30">
                                                    <th className="text-left p-4 font-semibold">Sipariş No</th>
                                                    <th className="text-left p-4 font-semibold">Tarih</th>
                                                    <th className="text-left p-4 font-semibold">Tutar</th>
                                                    <th className="text-left p-4 font-semibold">Durum</th>
                                                    <th className="text-right p-4 font-semibold">İşlem</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {isOrdersLoading ? (
                                                    <tr><td colSpan={5} className="p-8 text-center"><Skeleton className="h-20 w-full" /></td></tr>
                                                ) : orders.length === 0 ? (
                                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Henüz siparişiniz bulunmuyor.</td></tr>
                                                ) : orders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="p-4 font-bold">{order.orderNumber}</td>
                                                        <td className="p-4 text-muted-foreground">{new Date(order.orderDate).toLocaleDateString('tr-TR')}</td>
                                                        <td className="p-4 font-semibold">{formatCurrency(order.totalAmount)}</td>
                                                        <td className="p-4">
                                                            <Badge variant="secondary" className={
                                                                order.status === 'Kargoda' ? "bg-blue-500/10 text-blue-600" :
                                                                    order.status === 'Teslim Edildi' ? "bg-emerald-500/10 text-emerald-600" :
                                                                        "bg-amber-500/10 text-amber-600"
                                                            }>{order.status}</Badge>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <Button variant="ghost" size="sm">Detay</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="invoices" className="mt-6">
                            <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/30">
                                                    <th className="text-left p-4 font-semibold">Fatura No</th>
                                                    <th className="text-left p-4 font-semibold">Son Ödeme</th>
                                                    <th className="text-left p-4 font-semibold">Tutar</th>
                                                    <th className="text-left p-4 font-semibold">Durum</th>
                                                    <th className="text-right p-4 font-semibold">İndir</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {isInvoicesLoading ? (
                                                    <tr><td colSpan={5} className="p-8 text-center"><Skeleton className="h-20 w-full" /></td></tr>
                                                ) : invoices.length === 0 ? (
                                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Henüz faturanız bulunmuyor.</td></tr>
                                                ) : invoices.map((invoice) => (
                                                    <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="p-4 font-bold">{invoice.invoiceNumber}</td>
                                                        <td className="p-4 text-muted-foreground">{new Date(invoice.dueDate).toLocaleDateString('tr-TR')}</td>
                                                        <td className="p-4 font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                                                        <td className="p-4">
                                                            <Badge variant="secondary" className={
                                                                invoice.status === 'Ödendi' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                                            }>{invoice.status}</Badge>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <Button size="icon" variant="ghost" className="text-primary">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sağ Taraf: Temsilci Bilgileri ve Hızlı İşlemler */}
                <div className="space-y-6">
                    <Card className="bg-background/50 backdrop-blur-xl border-sidebar-border/50 shadow-xl shadow-primary/5">
                        <CardHeader>
                            <CardTitle className="text-md">Firma Temsilciniz</CardTitle>
                            <CardDescription>Size özel atanan müşteri danışmanı.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Osman Ali Aydemir</h4>
                                    <p className="text-xs text-muted-foreground font-medium">Kıdemli Müşteri Yöneticisi</p>
                                </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                    <Mail className="h-4 w-4" />
                                    <span>osman@antigravity.crm</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                    <Phone className="h-4 w-4" />
                                    <span>+90 (555) 000 00 00</span>
                                </div>
                            </div>
                            <Button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none">
                                Randevu Al
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-linear-to-br from-primary/10 to-transparent border-sidebar-border/50">
                        <CardHeader>
                            <CardTitle className="text-md">Limit ve Bakiye</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Güncel Borç Bakiye</span>
                                    <p className="text-3xl font-black">
                                        {summary ? formatCurrency(summary.outstandingBalance) : <Skeleton className="h-8 w-32" />}
                                    </p>
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-600 border-none px-2 py-0.5 text-[10px]">
                                    {summary ? `%${Math.round(((150000 - summary.outstandingBalance) / 150000) * 100)} Boş` : "..."}
                                </Badge>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: summary ? `${Math.min(100, (summary.outstandingBalance / 150000) * 100)}%` : "0%" }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">* Toplam kredi limitiniz ₺150.000'dir.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageWrapper>
    )
}
