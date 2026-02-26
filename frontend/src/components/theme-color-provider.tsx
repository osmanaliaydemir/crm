"use client"

import { useEffect, useState } from "react"
import { useThemeStore } from "@/store/themeStore"

// Shadcn UI OKLCH renk paletleri (Primary, Primary-Foreground, Ring vs için)
export const THEME_COLORS = {
    blue: {
        primary: "0.546 0.245 262.881", // blue-600
        primaryForeground: "0.985 0 0",
    },
    rose: {
        primary: "0.51 0.17 24.23", // rose-600 benzeri
        primaryForeground: "0.985 0 0",
    },
    emerald: {
        primary: "0.59 0.15 160", // emerald-600
        primaryForeground: "0.985 0 0",
    },
    violet: {
        primary: "0.45 0.18 290", // violet-600
        primaryForeground: "0.985 0 0",
    },
    amber: {
        primary: "0.7 0.18 80", // amber-500
        primaryForeground: "0.145 0 0",
    },
    neutral: {
        primary: "0.145 0 0", // zinc-900
        primaryForeground: "0.985 0 0",
    }
}

export function ThemeColorProvider() {
    const { primaryColor } = useThemeStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const root = document.documentElement
        const theme = THEME_COLORS[primaryColor]

        if (primaryColor === 'neutral') {
            // "neutral" aslında mevcut globals.css'teki varsayılan siyah/beyaz halimiz.
            // Bu özellikleri silersek globals.css 'teki dark mod black/white ayarı devralır.
            root.style.removeProperty('--primary')
            root.style.removeProperty('--primary-foreground')
            root.style.removeProperty('--ring')
            return;
        }

        if (theme) {
            root.style.setProperty('--primary', `oklch(${theme.primary})`)
            root.style.setProperty('--primary-foreground', `oklch(${theme.primaryForeground})`)
            root.style.setProperty('--ring', `oklch(${theme.primary})`) // odak halkası
        }
    }, [primaryColor, mounted])

    return null
}
