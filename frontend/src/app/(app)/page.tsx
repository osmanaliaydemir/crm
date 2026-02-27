"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ActivityTimeline } from "@/components/activity-timeline"
import { KpiCard } from "@/components/kpi-card"
import { SmartGreeting } from "@/components/smart-greeting"
import { MeshGradient } from "@/components/mesh-gradient"
import { motion } from "framer-motion"
import { PageWrapper } from "@/components/page-wrapper"
import { Button as UIButton } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { useDashboardSummary, useMonthlyFinancial } from "@/lib/hooks/useDashboardQueries"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const { user } = useAuthStore()

  const canViewRevenueChart = user?.role === "admin" || user?.role === "sales" || user?.role === "finance";

  // API'den veri çekme (Kpi için Summary, Grafik için 2026 Monthly Data)
  const { data: summaryData, isLoading: isSummaryLoading } = useDashboardSummary();
  const { data: monthlyData, isLoading: isMonthlyLoading } = useMonthlyFinancial(new Date().getFullYear());

  // Dinamik Kpi Datasunu Hazırla (Eğer API yükleniyorsa boş bir set kullan)
  const dynamicKpiData = summaryData ? [
    {
      title: "Toplam Müşteri",
      value: summaryData.totalCustomers.toLocaleString('tr-TR'),
      description: "Toplam kayıtlı cari",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Açık Projeler",
      value: summaryData.activeProjects.toString(),
      description: "Aktif proje sayısı",
      icon: Briefcase,
      color: "text-purple-500",
    },
    {
      title: "Bekleyen Sipariş",
      value: summaryData.activeOrders.toString(),
      description: "Teslimat bekleyen",
      icon: ShoppingCart,
      color: "text-orange-500",
    },
    {
      title: "Aylık Cari Net Kar",
      value: `₺${summaryData.netProfit.toLocaleString('tr-TR')}`,
      description: "Gelir - Gider Oranı",
      icon: TrendingUp,
      color: summaryData.netProfit >= 0 ? "text-green-500" : "text-destructive",
    }
  ] : [];

  // Yetkiye göre yeni dynamicKpiData filtrelenir
  const dynamicVisibleKpis = dynamicKpiData.filter(kpi => {
    if (user?.role === "admin") return true;
    if (user?.role === "sales") return kpi.title !== "Toplam Müşteri";
    if (user?.role === "finance") return kpi.title.includes("Kar") || kpi.title.includes("Sipariş");
    if (user?.role === "hr") return kpi.title === "Toplam Müşteri";
    return true;
  });

  // Recharts'in anlayacağı Ciro/Kazanç formatı 
  const dynamicChartData = monthlyData ? monthlyData.map(m => ({
    name: m.month,
    ciro: m.profit // veya income, backend'e göre
  })) : [];


  return (
    <PageWrapper className="flex flex-col gap-0 pb-10">
      <MeshGradient />

      <SmartGreeting />

      {/* KPI CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isSummaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[120px] w-full rounded-xl bg-muted/40" />)
        ) : (
          dynamicVisibleKpis.map((kpi, index) => (
            <KpiCard
              key={kpi.title}
              {...kpi}
              delay={index * 0.1}
              trendData={[]} // Gerçek backend'de varsa verilebilir
            />
          ))
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* REVENUE CHART - AUTHORIZED ONLY */}
        {canViewRevenueChart && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-8"
          >
            <Card className="h-full border shadow-sm bg-background/50 backdrop-blur-xl overflow-hidden hover:border-primary/20 transition-all duration-500">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Aylık Kar/Zarar Analizi (2026)</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Yıllık finansal performans verileri</p>
                </div>
                <UIButton variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </UIButton>
              </CardHeader>
              <CardContent className="px-2 sm:p-6">
                {isMonthlyLoading ? (
                  <div className="h-[350px] w-full flex items-center justify-center">
                    <Skeleton className="w-[90%] h-[300px] rounded-lg bg-muted/30" />
                  </div>
                ) : (
                  <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dynamicChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCiro" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value / 1000}k`} width={60} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '13px' }}
                          labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '8px', fontWeight: 'bold' }}
                          formatter={(value: any) => [`₺${Number(value).toLocaleString('tr-TR')}`, 'Kazanç']}
                        />
                        <Area type="monotone" dataKey="ciro" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCiro)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={canViewRevenueChart ? "md:col-span-4" : "md:col-span-12"}
        >
          <Card className="h-full border shadow-sm bg-background/50 backdrop-blur-xl overflow-hidden hover:border-primary/20 transition-all duration-500">
            <CardHeader>
              <CardTitle className="text-lg">Canlı Aktivite Akışı</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Sistem genelindeki son hareketler</p>
            </CardHeader>
            <CardContent className="p-6">
              <ActivityTimeline />
              <div className="mt-8">
                <UIButton variant="outline" className="w-full text-xs font-semibold rounded-full" size="sm">Tüm Akışı Gör</UIButton>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  )
}

