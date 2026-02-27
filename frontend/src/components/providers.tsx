"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "sonner"
import { useState } from "react"
import { ThemeColorProvider } from "./theme-color-provider"
import { AuthInitializer } from "./auth-initializer"

export function Providers({ children }: { children: React.ReactNode }) {
    // SSR sorunlarını önlemek için QueryClient instance'ını useState içinde tutuyoruz
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
            }
        }
    }))

    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ThemeColorProvider />
            <QueryClientProvider client={queryClient}>
                <AuthInitializer>
                    {children}
                </AuthInitializer>
                <Toaster richColors position="top-right" />
            </QueryClientProvider>
        </NextThemesProvider>
    )
}
