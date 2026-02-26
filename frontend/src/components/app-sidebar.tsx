"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { filterMenuItems } from "@/lib/rbac"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Box,
  ShoppingCart,
  ReceiptText,
  Settings,
  Building2,
  Calendar,
  FolderKanban,
  UserCircle,
  BarChart3,
  Search,
  Command,
  LogOut,
  ChevronUp,
  Contact,
  ShieldEllipsis
} from "lucide-react"

const items = [
  {
    title: "Gösterge Paneli",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Analitik Raporlar",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Müşteriler",
    url: "/crm",
    icon: Users,
  },
  {
    title: "Ajanda & Takvim",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Satış Fırsatları",
    url: "/pipeline",
    icon: Briefcase,
  },
  {
    title: "Ürün & Envanter",
    url: "/inventory",
    icon: Box,
  },
  {
    title: "Sipariş & Operasyon",
    url: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Projeler",
    url: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Ön Muhasebe & Finans",
    url: "/finance",
    icon: ReceiptText,
  },
  {
    title: "İnsan Kaynakları",
    url: "/hr",
    icon: Contact,
  },
  {
    title: "Personel Portalı",
    url: "/employee-portal",
    icon: UserCircle,
  },
]

const settingsItems = [
  {
    title: "Profil & Güvenlik",
    url: "/settings/profile",
    icon: UserCircle,
  },
  {
    title: "Firma Ayarları",
    url: "/settings/company",
    icon: Building2,
  },
  {
    title: "Sistem Ayarları",
    url: "/settings/system",
    icon: Settings,
  },
  {
    title: "İşlem Kayıtları (Audit)",
    url: "/settings/audit-logs",
    icon: ShieldEllipsis,
  },
]

export function AppSidebar() {
  const { state, setOpen } = useSidebar()
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Kullanıcı "Sistem" menüsü altındaki bir yerdeyse Sidebar default olarak açık (expanded / hover misali) kalsın:
  useEffect(() => {
    if (pathname.startsWith("/settings") && state === "collapsed") {
      setOpen(true)
    }
  }, [pathname, state, setOpen])

  // Hydration önlemi (Server -> Client DOM mismatch) ve menü kısıtlamaları
  // İstemci ve Sunucu varsayılan authStore içeriğini aynı okur (role = "admin")
  // Boş liste döndürmek Radix ID'lerin kaymasına yol açıyor, o yüzden direkt filtrelenmiş veriyi gösteriyoruz.
  const role = user?.role || "sales"
  const filteredItems = filterMenuItems(items, role)
  const filteredSettingsItems = filterMenuItems(settingsItems, role)

  return (
    <Sidebar variant="sidebar" className="bg-transparent border-r-0">
      {/* Header - Logo & Search */}
      <SidebarHeader className="h-32 flex flex-col justify-start pt-6 px-4 border-b border-sidebar-border/50 backdrop-blur-md">
        <div className="flex items-center gap-3 font-bold w-full mb-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex aspect-square size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Building2 className="size-5" />
          </motion.div>
          {state === "expanded" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="truncate text-sm leading-tight">Universal CRM</span>
              <span className="text-[10px] text-muted-foreground font-normal">Kurumsal Yönetim</span>
            </motion.div>
          )}
        </div>

        {/* Quick Search Button (Cmd+K Placeholder) */}
        {state === "expanded" && (
          <motion.button
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg bg-muted/40 border border-sidebar-border/40 text-muted-foreground hover:bg-muted/60 transition-all text-xs mb-2"
            onClick={() => document.dispatchEvent(new CustomEvent('openCommandMenu'))}
          >
            <Search className="size-3.5" />
            <span className="flex-1 text-left">Hızlı Arama...</span>
            <div className="flex items-center gap-1 opacity-60">
              <Command className="size-2.5" />
              <span>K</span>
            </div>
          </motion.button>
        )}
      </SidebarHeader>

      <SidebarContent className="scrollbar-hide bg-sidebar/60 backdrop-blur-xl">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold opacity-50 px-4 mt-2">Menü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-1">
              {filteredItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive} className="relative group overflow-hidden h-10 rounded-xl transition-all hover:bg-primary/5">
                      <a href={item.url} className={`flex items-center gap-3 ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                        <div className={`p-1.5 rounded-lg transition-all ${isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted group-hover:bg-muted/80"}`}>
                          <item.icon className="size-4" />
                        </div>
                        <span className="text-sm">{item.title}</span>

                        {isActive && (
                          <motion.div
                            layoutId="active-nav"
                            className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}

                        {isActive && state === "expanded" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-3 size-1.5 rounded-full bg-primary"
                          />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold opacity-50 px-4">Sistem</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-1">
              {filteredSettingsItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive} className={cn("relative group overflow-hidden h-10 rounded-xl transition-all hover:bg-primary/5", isActive && "bg-primary/5")}>
                      <a href={item.url} className={`flex items-center gap-3 ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                        <div className={`p-1.5 rounded-lg transition-all ${isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted group-hover:bg-muted/80"}`}>
                          <item.icon className="size-4" />
                        </div>
                        <span className="text-sm">{item.title}</span>

                        {isActive && (
                          <motion.div
                            layoutId="active-nav"
                            className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}

                        {isActive && state === "expanded" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-3 size-1.5 rounded-full bg-primary"
                          />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Professional User Card */}
      <SidebarFooter className="p-4 bg-sidebar/60 backdrop-blur-xl border-t border-sidebar-border/50">
        <motion.div
          whileHover={{ y: -2 }}
          className="flex items-center gap-3 p-2 rounded-2xl bg-muted/30 border border-sidebar-border/20 hover:bg-muted/50 transition-all group"
        >
          <div className="relative">
            <div className="size-9 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
              OA
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-green-500 border-2 border-background shadow-sm" title="Online" />
          </div>

          {state === "expanded" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col flex-1 min-w-0"
            >
              <span className="text-xs font-bold truncate">Osman Ali</span>
              <span className="text-[10px] text-muted-foreground truncate font-medium">Baş Mimarı</span>
            </motion.div>
          )}

          {state === "expanded" && (
            <Button variant="ghost" size="icon" className="size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <LogOut className="size-4 text-muted-foreground hover:text-destructive" />
            </Button>
          )}
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  )
}
