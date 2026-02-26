"use client"

import { useState } from "react"
import { Bell, Check, Package, CreditCard, Calendar, MessageSquare, Trash2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

import { useNotificationStore } from "@/store/notifications"

const getIconForType = (type: string) => {
    switch (type) {
        case "order": return <Package className="h-5 w-5 text-blue-500" />;
        case "finance": return <CreditCard className="h-5 w-5 text-emerald-500" />;
        case "calendar": return <Calendar className="h-5 w-5 text-purple-500" />;
        case "mention": return <MessageSquare className="h-5 w-5 text-amber-500" />;
        case "system": return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
}

import { PageWrapper } from "@/components/page-wrapper"

export default function NotificationsPage() {
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore()
    const [activeTab, setActiveTab] = useState("all")

    const handleMarkAllAsRead = () => {
        markAllAsRead()
        toast.success("Tüm bildirimler okundu olarak işaretlendi.")
    }

    const handleDelete = (id: string) => {
        deleteNotification(id)
        toast.success("Bildirim silindi.")
    }

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === "unread") return !n.read;
        if (activeTab === "mentions") return n.type === "mention";
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <PageWrapper className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bildirim Merkezi</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Tüm duyurular, sistem uyarıları ve görev bildirimlerinizi buradan takip edebilirsiniz.
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={handleMarkAllAsRead} className="shrink-0 hover:bg-primary/5 hover:text-primary transition-colors">
                        <Check className="mr-2 h-4 w-4" />
                        Tümünü Okundu İşaretle
                    </Button>
                )}
            </div>

            <Card className="border shadow-md bg-linear-to-b from-background to-background/50 overflow-hidden flex flex-col min-h-[600px]">
                <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/10 shrink-0">
                    <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-muted/50 h-10 w-full sm:w-auto grid grid-cols-3 sm:flex">
                            <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Tümü
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
                                Okunmayanlar
                                {unreadCount > 0 && (
                                    <Badge variant="secondary" className="h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full bg-primary/20 text-primary">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="mentions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Bahsedilmeler
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/5 space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-500">
                            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center ring-8 ring-background mb-4 transition-transform hover:scale-105">
                                <Bell className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="font-medium text-lg text-foreground">Bildirim Bulunmuyor</h3>
                            <p className="text-sm text-center max-w-sm mt-2">
                                Harika! Okunmamış veya bu kategoriye ait herhangi bir bildiriminiz yok.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 relative">
                            {/* Time timeline line */}
                            <div className="absolute top-0 bottom-0 left-[27px] sm:left-[35px] w-px bg-border/50 hidden sm:block"></div>

                            {filteredNotifications.map((notif, index) => (
                                <div
                                    key={notif.id}
                                    className={`relative z-10 flex gap-4 p-4 rounded-xl border transition-all duration-300 group
                                        ${notif.read ? 'bg-background hover:bg-muted/30 hover:border-border/80 shadow-sm' : 'bg-primary/5 hover:bg-primary/10 border-primary/20 shadow-md ring-1 ring-primary/10'}
                                    `}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Icon Avatar */}
                                    <div className="shrink-0 relative">
                                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center border-4 border-background shadow-sm ${notif.read ? 'bg-muted' : 'bg-background'}`}>
                                            {getIconForType(notif.type)}
                                        </div>
                                        {!notif.read && (
                                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className={`text-base font-semibold leading-none ${notif.read ? 'text-foreground/80' : 'text-foreground'}`}>
                                                    {notif.title}
                                                </h4>
                                                {notif.priority === 'high' && (
                                                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider">Acil</Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground sm:hidden flex items-center gap-1">
                                                    • {notif.time}
                                                </span>
                                            </div>
                                            <p className={`text-sm mt-1 leading-relaxed ${notif.read ? 'text-muted-foreground' : 'text-foreground/90 font-medium'}`}>
                                                {notif.description}
                                            </p>
                                        </div>

                                        {/* Actions & Time */}
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                                            <span className="text-xs text-muted-foreground hidden sm:block font-medium whitespace-nowrap">
                                                {notif.time}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notif.read && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/20" onClick={() => markAsRead(notif.id)} title="Okundu işaretle">
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(notif.id)} title="Sil">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clickable Overlay */}
                                    <div className="absolute inset-0 z-0 cursor-pointer rounded-xl" onClick={() => !notif.read && markAsRead(notif.id)}></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </PageWrapper>
    )
}
