import React from "react"
import { ArrowUpRight, ArrowDownRight, Wallet, FileText, Banknote, CreditCard, Landmark, TrendingUp } from "lucide-react"
import { KpiCard } from "@/components/kpi-card"
import { Transaction, BankAccount } from "@/types/finance"

interface FinanceStatsProps {
    transactions: Transaction[];
    accounts: BankAccount[];
}

export function FinanceStats({ transactions, accounts }: FinanceStatsProps) {
    // Toplam Bakiye (Hesapların toplamı)
    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0)

    // Bu ayın tarih aralığı
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Aylık Tahsilat (Gelir)
    const monthlyIncome = transactions
        .filter(t => t.type === 'in' && new Date(t.date) >= firstDayOfMonth && t.status === 'Tamamlandı')
        .reduce((acc, curr) => acc + curr.amount, 0)

    // Aylık Gider
    const monthlyExpense = transactions
        .filter(t => t.type === 'out' && new Date(t.date) >= firstDayOfMonth && t.status === 'Tamamlandı')
        .reduce((acc, curr) => acc + curr.amount, 0)

    // Ödenecek Faturalar (Bekleyen Giderler)
    const pendingExpenses = transactions
        .filter(t => t.type === 'out' && t.status === 'Bekliyor')
        .reduce((acc, curr) => acc + curr.amount, 0)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount)
    }

    const kpiData = [
        {
            title: "Toplam Bakiye",
            value: formatCurrency(totalBalance),
            description: "Tüm kasa ve bankalar",
            icon: Landmark,
            color: "text-blue-500",
            trendData: [{ value: totalBalance * 0.8 }, { value: totalBalance * 0.9 }, { value: totalBalance }]
        },
        {
            title: "Aylık Tahsilat",
            value: formatCurrency(monthlyIncome),
            description: "Bu ayki toplam gelir",
            icon: TrendingUp,
            color: "text-green-500",
            trendData: [{ value: monthlyIncome * 0.5 }, { value: monthlyIncome * 0.8 }, { value: monthlyIncome }]
        },
        {
            title: "Aylık Gider",
            value: formatCurrency(monthlyExpense),
            description: "Bu ayki toplam harcama",
            icon: ArrowDownRight,
            color: "text-red-500",
            trendData: [{ value: monthlyExpense * 0.5 }, { value: monthlyExpense * 0.8 }, { value: monthlyExpense }]
        },
        {
            title: "Bekleyen Ödemeler",
            value: formatCurrency(pendingExpenses),
            description: "Onay bekleyen giderler",
            icon: FileText,
            color: "text-orange-500",
            trendData: [{ value: pendingExpenses * 0.7 }, { value: pendingExpenses * 0.9 }, { value: pendingExpenses }]
        }
    ]

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
