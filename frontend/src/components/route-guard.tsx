"use client"

import { useAuthStore } from "@/store/authStore"
import { isRouteAllowed } from "@/lib/rbac"
import { usePathname, useRouter } from "next/navigation"
import { Unauthorized } from "./unauthorized"
import { useEffect } from "react"

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore()
    const pathname = usePathname()
    const router = useRouter()

    const role = user?.role || "sales"

    useEffect(() => {
        if (role === "employee" && pathname === "/") {
            router.push("/employee-portal")
        }
    }, [role, pathname, router])

    if (role === "employee" && pathname === "/") {
        return null // Redirect işlemi gerçekleşirken yetkisiz ekranı parlamasın
    }

    if (!isRouteAllowed(pathname, role)) {
        return <Unauthorized />
    }

    return <>{children}</>
}
