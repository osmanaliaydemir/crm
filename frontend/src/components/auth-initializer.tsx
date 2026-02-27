"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { authService } from "@/lib/services/auth.service"
import { parseCookies } from "nookies"

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const { user, login, logout } = useAuthStore()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const initAuth = async () => {
            const cookies = parseCookies()
            const token = cookies.token

            if (token && !user) {
                try {
                    const userData = await authService.me()
                    login(userData)
                } catch (error) {
                    console.error("Auth initialization failed:", error)
                    logout()
                }
            }
            setIsLoading(false)
        }

        initAuth()
    }, [user, login, logout])

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">Oturum kontrol ediliyor...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
