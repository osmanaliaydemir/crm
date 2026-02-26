"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Package,
    Briefcase,
    Bell,
    Moon,
    Sun,
    Search,
    Plus,
    Contact,
    ShieldEllipsis,
} from "lucide-react"
import { Command } from "cmdk"
import { useTheme } from "next-themes"

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { useNotificationStore } from "@/store/notifications"
import { useAuthStore } from "@/store/authStore"
import { isRouteAllowed } from "@/lib/rbac"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const { setTheme } = useTheme()
    const { addNotification } = useNotificationStore()
    const { user } = useAuthStore()
    const role = user?.role || "sales"

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        const openMenu = () => setOpen(true)

        document.addEventListener("keydown", down)
        document.addEventListener("openCommandMenu", openMenu)
        return () => {
            document.removeEventListener("keydown", down)
            document.removeEventListener("openCommandMenu", openMenu)
        }
    }, [])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-[600px] border-none" showCloseButton={false}>
                <DialogTitle className="sr-only">Komut Paleti</DialogTitle>
                <DialogDescription className="sr-only">
                    Uygulama içinde hızlı gezinme ve aksiyonlar için arama yapın.
                </DialogDescription>
                <Command className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
                    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            placeholder="Bir komut yazın veya arama yapın..."
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                        <Command.Empty className="py-6 text-center text-sm">Sonuç bulunamadı.</Command.Empty>

                        <Command.Group heading="Hızlı Gezinme" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            {isRouteAllowed("/", role) && (
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/"))}
                                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>Dashboard / Ana Sayfa</span>
                                </Command.Item>
                            )}
                            {isRouteAllowed("/pipeline", role) && (
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/pipeline"))}
                                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                                >
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    <span>Satış Fırsatları (Pipeline)</span>
                                </Command.Item>
                            )}
                            {isRouteAllowed("/projects", role) && (
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/projects"))}
                                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                                >
                                    <Package className="mr-2 h-4 w-4" />
                                    <span>Projeler</span>
                                </Command.Item>
                            )}
                            {isRouteAllowed("/inventory", role) && (
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/inventory"))}
                                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    <span>Envanter & Stok</span>
                                </Command.Item>
                            )}
                            {isRouteAllowed("/notifications", role) && (
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/notifications"))}
                                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                                >
                                    <Bell className="mr-2 h-4 w-4" />
                                    <span>Bildirimler</span>
                                </Command.Item>
                            )}
                            {isRouteAllowed("/calendar", role) && (
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/calendar"))}
                                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>İş Takvimi</span>
                                </Command.Item>
                            )}
                            {isRouteAllowed("/reports", role) && (
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/reports"))}
                                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                                >
                                    <Calculator className="mr-2 h-4 w-4" />
                                    <span>Performans Raporları</span>
                                </Command.Item>
                            )}
                            {isRouteAllowed("/hr", role) && (
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/hr"))}
                                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                                >
                                    <Contact className="mr-2 h-4 w-4" />
                                    <span>İnsan Kaynakları</span>
                                </Command.Item>
                            )}
                        </Command.Group>

                        <Command.Separator className="-mx-2 my-1 h-px bg-border" />

                        <Command.Group heading="Hızlı Aksiyonlar" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            <Command.Item
                                onSelect={() => runCommand(() => {
                                    addNotification({
                                        type: "system",
                                        title: "Test Bildirimi",
                                        description: "Komut paleti üzerinden bir test bildirimi oluşturuldu.",
                                        priority: "low"
                                    })
                                })}
                                className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Test Bildirimi Gönder</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("light"))}
                                className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                            >
                                <Sun className="mr-2 h-4 w-4" />
                                <span>Aydınlık Mod</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("dark"))}
                                className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                            >
                                <Moon className="mr-2 h-4 w-4" />
                                <span>Karanlık Mod</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Separator className="-mx-2 my-1 h-px bg-border" />

                        <Command.Group heading="Ayarlar" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            {isRouteAllowed("/settings", role) && (
                                <>
                                    <Command.Item
                                        onSelect={() => runCommand(() => router.push("/settings"))}
                                        className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Sistem Ayarları</span>
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => runCommand(() => router.push("/settings/audit-logs"))}
                                        className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                                    >
                                        <ShieldEllipsis className="mr-2 h-4 w-4" />
                                        <span>İşlem Denetimi (Audit Logs)</span>
                                    </Command.Item>
                                </>
                            )}
                        </Command.Group>
                    </Command.List>
                    <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground bg-muted/20">
                        <div className="flex items-center gap-2">
                            <span>Seçmek için</span>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span>↵</span>
                            </kbd>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Kapatmak için</span>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span>ESC</span>
                            </kbd>
                        </div>
                    </div>
                </Command>
            </DialogContent>
        </Dialog>
    )
}

function ShoppingCart(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
    )
}

function Users(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
