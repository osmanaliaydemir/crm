"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Bell, Search, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

import { useTheme } from "next-themes"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotificationStore } from "@/store/notifications"
import { useAuthStore, UserRole } from "@/store/authStore"

export function AppHeader() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const { notifications, markAsRead } = useNotificationStore()
    const { user, switchRole } = useAuthStore()

    const unreadCount = notifications.filter(n => !n.read).length
    const recentNotifications = notifications.slice(0, 4)

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="relative hidden w-full max-w-sm sm:flex items-center">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Müşteri, Fırsat veya Sipariş Ara..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                {mounted ? (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                                    <span className="text-muted-foreground whitespace-nowrap">Rol: <span className="text-foreground capitalize font-bold">{user?.role || "Giriş Yok"}</span></span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Test Rolü Seç</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => switchRole("admin")}>Yönetim (Admin)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => switchRole("sales")}>Satış Temsilcisi (Sales)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => switchRole("finance")}>Finans (Finance)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => switchRole("hr")}>İnsan Kaynakları (HR)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => switchRole("employee")}>Personel (Employee)</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            <span className="sr-only">Toggle theme</span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
                                    )}
                                    <span className="sr-only">Bildirimleri aç</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel className="font-semibold text-lg">Bildirimler {unreadCount > 0 && `(${unreadCount})`}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="max-h-[300px] overflow-y-auto">
                                    {recentNotifications.length > 0 ? recentNotifications.map(notif => (
                                        <DropdownMenuItem
                                            key={notif.id}
                                            className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${notif.read ? 'opacity-70 focus:bg-muted/30' : 'bg-primary/5 focus:bg-primary/10'}`}
                                            onClick={() => !notif.read && markAsRead(notif.id)}
                                        >
                                            <span className={`font-medium text-sm ${notif.type === 'finance' ? 'text-emerald-600 dark:text-emerald-400' : notif.type === 'calendar' ? 'text-purple-600 dark:text-purple-400' : notif.type === 'mention' ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                                                {notif.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground line-clamp-2">{notif.description}</span>
                                            <span className="text-[10px] text-muted-foreground mt-1">{notif.time}</span>
                                        </DropdownMenuItem>
                                    )) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">Bildiriminiz Yok</div>
                                    )}
                                </div>
                                <DropdownMenuSeparator />
                                <Link href="/notifications" className="block w-full">
                                    <Button variant="ghost" className="w-full text-xs text-primary" size="sm">Tüm Bildirimleri Gör</Button>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <>
                        {/* SSR Layout Shift Engellemek için Skeleton (Birebir Ayna Düzeni) */}
                        <div className="h-9 w-[120px] bg-muted/40 rounded-md animate-pulse hidden md:block"></div>
                        <div className="h-9 w-9 bg-muted/40 rounded-md animate-pulse"></div>
                        <div className="h-9 w-9 bg-muted/40 rounded-md animate-pulse"></div>
                    </>
                )}
            </div>
        </header>
    )
}
