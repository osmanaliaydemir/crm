"use client"

import * as React from "react"
import {
    BarChart as BarChartIcon,
    TrendingUp,
    PieChart as PieChartIcon,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    FileDown
} from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/page-wrapper"

const salesData = [
    { name: 'Oca', satis: 4000, hedef: 4500 },
    { name: 'Şub', satis: 3000, hedef: 4500 },
    { name: 'Mar', satis: 5000, hedef: 4500 },
    { name: 'Nis', satis: 2780, hedef: 4500 },
    { name: 'May', satis: 1890, hedef: 4500 },
    { name: 'Haz', satis: 2390, hedef: 5000 },
    { name: 'Tem', satis: 3490, hedef: 5500 },
]

const categoryData = [
    { name: 'Yazılım', value: 400 },
    { name: 'Donanım', value: 300 },
    { name: 'Hizmet', value: 200 },
    { name: 'Eğitim', value: 100 },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function ReportsPage() {
    return (
        <PageWrapper className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Performans Raporları</h1>
                    <p className="text-muted-foreground">
                        Satış, envanter ve operasyonel verilerinizin detaylı analizi.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" /> Filtrele
                    </Button>
                    <Button variant="default" size="sm">
                        <FileDown className="mr-2 h-4 w-4" /> Raporu İndir
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-linear-to-b from-background to-blue-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₺1.2M</div>
                        <div className="flex items-center text-xs text-green-600 mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            <span>+15% geçen yıla göre</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-linear-to-b from-background to-green-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aktif Projeler</CardTitle>
                        <BarChartIcon className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <div className="flex items-center text-xs text-green-600 mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            <span>+4 yeni proje</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-linear-to-b from-background to-orange-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Müşteri Memnuniyeti</CardTitle>
                        <PieChartIcon className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94%</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">Hedef: 95%</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-linear-to-b from-background to-red-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kritik Stok</CardTitle>
                        <Badge variant="destructive" className="h-5 p-1 rounded-full animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <div className="flex items-center text-xs text-red-600 mt-1">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            <span>-2 azaldı</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-md bg-linear-to-b from-background to-background/50">
                    <CardHeader>
                        <CardTitle>Satış Karşılaştırması</CardTitle>
                        <CardDescription>Gerçekleşen satışlar ve aylık hedefler (₺)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="satis" name="Gerçekleşen" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="hedef" name="Hedef" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-md bg-linear-to-b from-background to-background/50">
                    <CardHeader>
                        <CardTitle>Kategori Dağılımı</CardTitle>
                        <CardDescription>Ürün ve hizmet bazlı gelir dağılımı</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full mt-6 space-y-2">
                            {categoryData.map((item, i) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                        <span className="text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="font-semibold">%{Math.round(item.value / 10)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-md bg-linear-to-b from-background to-background/50">
                <CardHeader>
                    <CardTitle>Performans Trendi</CardTitle>
                    <CardDescription>Son 7 ayın büyüme ve etkileşim grafiği</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                                />
                                <Line type="monotone" dataKey="satis" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </PageWrapper>
    )
}
