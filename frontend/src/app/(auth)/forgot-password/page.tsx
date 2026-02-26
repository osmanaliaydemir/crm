"use client"

import Link from "next/link"
import { ArrowLeft, MailCheck } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false)

    if (isSubmitted) {
        return (
            <div className="flex flex-col space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="flex aspect-square size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <MailCheck className="size-8" />
                    </div>
                </div>
                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">Postanızı Kontrol Edin</h1>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Şifre sıfırlama bağlantısını içeren bir e-posta gönderdik. Lütfen gelen kutunuzu kontrol edin.
                    </p>
                </div>

                <Button
                    variant="outline"
                    className="w-full h-11 font-medium mt-4"
                    onClick={() => setIsSubmitted(false)}
                >
                    Tekrar Gönder
                </Button>
                <div className="mt-4">
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                        <ArrowLeft className="size-4" />
                        Giriş ekranına dön
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
                <h1 className="text-2xl font-semibold tracking-tight">Şifremi Unuttum</h1>
                <p className="text-sm text-muted-foreground">
                    E-posta adresinizi girin, size şifre sıfırlama talimatlarını gönderelim.
                </p>
            </div>

            <form
                className="flex flex-col space-y-4"
                onSubmit={(e) => {
                    e.preventDefault()
                    setIsSubmitted(true)
                }}
            >
                <div className="space-y-2">
                    <Label htmlFor="email">E-Posta Adresiniz</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="ornek@sirketiniz.com"
                        required
                        className="h-11"
                    />
                </div>

                <Button type="submit" className="w-full h-11 font-medium mt-2">
                    Sıfırlama Bağlantısı Gönder
                </Button>
            </form>

            <div className="text-center">
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                    <ArrowLeft className="size-4" />
                    Giriş ekranına dön
                </Link>
            </div>
        </div>
    )
}
