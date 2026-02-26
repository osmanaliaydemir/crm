"use client"

import { ShieldAlert, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Unauthorized() {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[70vh] animate-in fade-in duration-500">
            <div className="h-24 w-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 ring-4 ring-background">
                <ShieldAlert className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Yetkiniz Bulunmamaktadır</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Mevcut rolünüz ile bu sayfaya veya içeriğe erişim yetkiniz bulunmuyor. Sol menüden yetkili olduğunuz sayfalara gidebilir veya üst sekmeden (test amaçlı) rolünüzü değiştirebilirsiniz.
            </p>
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Önceki Sayfaya Dön
                </Button>
                <Button onClick={() => router.push("/")} className="gap-2">
                    <Home className="h-4 w-4" />
                    Ana Sayfaya Git
                </Button>
            </div>
        </div>
    )
}
