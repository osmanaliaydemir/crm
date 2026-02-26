"use client"

import * as React from "react"
import {
    CheckCircle2,
    Circle,
    Clock,
    MessageSquare,
    PlusCircle,
    TrendingUp,
    UserPlus,
    Package
} from "lucide-react"

interface Activity {
    id: string
    type: "deal" | "project" | "comment" | "user" | "inventory"
    title: string
    description: string
    time: string
    status?: "success" | "warning" | "info"
}

const mockActivities: Activity[] = [
    {
        id: "1",
        type: "deal",
        title: "Yeni Fırsat Kazanıldı",
        description: "ERP Entegrasyon projesi için TechCorp ile sözleşme imzalandı.",
        time: "10 dk önce",
        status: "success"
    },
    {
        id: "2",
        type: "comment",
        title: "Yeni Yorum",
        description: "Zeynep Ata, 'Cisco Switch' projesine bir yorum ekledi.",
        time: "1 saat önce",
        status: "info"
    },
    {
        id: "3",
        type: "inventory",
        title: "Kritik Stok Uyarısı",
        description: "Ergonomik Ofis Koltuğu stokları 3 adetin altına düştü.",
        time: "3 saat önce",
        status: "warning"
    },
    {
        id: "4",
        type: "user",
        title: "Yeni Müşteri Kaydı",
        description: "Global Lojistik sistemde yeni bir müşteri olarak tanımlandı.",
        time: "5 saat önce",
        status: "info"
    },
    {
        id: "5",
        type: "project",
        title: "Proje Güncellemesi",
        description: "Bulut Taşıma projesinin ilerlemesi %85 olarak güncellendi.",
        time: "Dün",
        status: "success"
    }
]

export function ActivityTimeline() {
    const getIcon = (type: Activity["type"], status?: Activity["status"]) => {
        const colorClass = status === "success" ? "text-green-500 bg-green-500/10" :
            status === "warning" ? "text-orange-500 bg-orange-500/10" :
                "text-blue-500 bg-blue-500/10"

        switch (type) {
            case "deal": return <TrendingUp className={`h-4 w-4 ${colorClass} rounded-full p-0.5`} />
            case "comment": return <MessageSquare className={`h-4 w-4 ${colorClass} rounded-full p-0.5`} />
            case "inventory": return <Package className={`h-4 w-4 ${colorClass} rounded-full p-0.5`} />
            case "user": return <UserPlus className={`h-4 w-4 ${colorClass} rounded-full p-0.5`} />
            case "project": return <CheckCircle2 className={`h-4 w-4 ${colorClass} rounded-full p-0.5`} />
            default: return <Circle className={`h-4 w-4 ${colorClass} rounded-full p-0.5`} />
        }
    }

    return (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
            {mockActivities.map((activity) => (
                <div key={activity.id} className="relative flex items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-background border shadow-sm z-10">
                        {getIcon(activity.type, activity.status)}
                    </div>
                    <div className="ml-12 pt-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <h4 className="text-sm font-semibold leading-none">{activity.title}</h4>
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full w-fit">
                                {activity.time}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {activity.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
