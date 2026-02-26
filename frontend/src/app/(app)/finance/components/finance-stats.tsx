"use client"

import React from "react"
import { ArrowUpRight, ArrowDownRight, Wallet, FileText, Banknote, CreditCard, Landmark, TrendingUp } from "lucide-react"
import { KpiCard } from "@/components/kpi-card"

const kpiData = [
    {
        title: "Toplam Bakiye",
        value: "₺345,200",
        description: "+12% geçen aydan",
        icon: Landmark,
        color: "text-blue-500",
        trendData: [
            { value: 250000 }, { value: 275000 }, { value: 265000 }, { value: 310000 }, { value: 325000 }, { value: 345200 }
        ]
    },
    {
        title: "Aylık Tahsilat",
        value: "₺185,000",
        description: "+6% geçen aydan",
        icon: TrendingUp,
        color: "text-green-500",
        trendData: [
            { value: 120000 }, { value: 135000 }, { value: 160000 }, { value: 145000 }, { value: 170000 }, { value: 185000 }
        ]
    },
    {
        title: "Aylık Gider",
        value: "₺130,700",
        description: "-2% geçen aydan",
        icon: ArrowDownRight,
        color: "text-red-500",
        trendData: [
            { value: 150000 }, { value: 145000 }, { value: 140000 }, { value: 138000 }, { value: 135000 }, { value: 130700 }
        ]
    },
    {
        title: "Ödenecek Faturalar",
        value: "₺24,500",
        description: "Yaklaşan 3 Fatura",
        icon: FileText,
        color: "text-orange-500",
        trendData: [
            { value: 15000 }, { value: 28000 }, { value: 22000 }, { value: 18000 }, { value: 30000 }, { value: 24500 }
        ]
    }
]

export function FinanceStats() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi, index) => (
                <KpiCard
                    key={kpi.title}
                    {...kpi}
                    delay={index * 0.1}
                />
            ))}
        </div>
    )
}
