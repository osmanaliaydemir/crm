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

const chartData = [
  { name: 'Oca', ciro: 120000 },
  { name: 'Şub', ciro: 145000 },
  { name: 'Mar', ciro: 110000 },
  { name: 'Nis', ciro: 175000 },
  { name: 'May', ciro: 210000 },
  { name: 'Haz', ciro: 195000 },
  { name: 'Tem', ciro: 245600 },
]

const kpiData = [
  {
    title: "Toplam Müşteri",
    value: "1,245",
    description: "+12% geçen aydan",
    icon: Users,
    color: "text-blue-500",
    trendData: [
      { value: 400 }, { value: 300 }, { value: 450 }, { value: 400 }, { value: 500 }, { value: 600 }
    ]
  },
  {
    title: "Açık Fırsatlar",
    value: "142",
    description: "+5% geçen aydan",
    icon: Briefcase,
    color: "text-purple-500",
    trendData: [
      { value: 100 }, { value: 120 }, { value: 110 }, { value: 130 }, { value: 125 }, { value: 142 }
    ]
  },
  {
    title: "Satış Bekleyen",
    value: "34",
    description: "-2% geçen aydan",
    icon: ShoppingCart,
    color: "text-orange-500",
    trendData: [
      { value: 50 }, { value: 45 }, { value: 48 }, { value: 40 }, { value: 38 }, { value: 34 }
    ]
  },
  {
    title: "Aylık Tahmini Ciro",
    value: "₺245,600",
    description: "+18% geçen aydan",
    icon: TrendingUp,
    color: "text-green-500",
    trendData: [
      { value: 180000 }, { value: 200000 }, { value: 190000 }, { value: 220000 }, { value: 230000 }, { value: 245600 }
    ]
  }
]

export default function Home() {
  const { user } = useAuthStore()

  // Yetki Kontrolü: Hangi roller hangi metrikleri görebilir?
  const visibleKpis = kpiData.filter(kpi => {
    if (user?.role === "admin") return true;
    if (user?.role === "sales") return kpi.title !== "Toplam Müşteri"; // Örn. Satış yöneticisi finans ağırlıklı bakar
    if (user?.role === "finance") return kpi.title.includes("Ciro") || kpi.title.includes("Satış");
    if (user?.role === "hr") return kpi.title === "Toplam Müşteri"; // İK Müşteri yerine personel sayar varsayımı
    return true;
  });

  const canViewRevenueChart = user?.role === "admin" || user?.role === "sales" || user?.role === "finance";

  return (
    <PageWrapper className="flex flex-col gap-0 pb-10">
      <MeshGradient />

      <SmartGreeting />

      {/* KPI CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {visibleKpis.map((kpi, index) => (
          <KpiCard
            key={kpi.title}
            {...kpi}
            delay={index * 0.1}
          />
        ))}
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
                  <CardTitle className="text-lg">Satış ve Ciro Analizi</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Son 7 aylık performans verileri</p>
                </div>
                <UIButton variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </UIButton>
              </CardHeader>
              <CardContent className="px-2 sm:p-6">
                <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        formatter={(value: any) => [`₺${Number(value).toLocaleString('tr-TR')}`, 'Ciro']}
                      />
                      <Area type="monotone" dataKey="ciro" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCiro)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
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

