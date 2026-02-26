"use client"

import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { setCookie } from "nookies"
import { api } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz."),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 800))
            const token = "demo-jwt-token-12345";
            if (data.email === "osmanaliaydemir@hotmail.com" && data.password === "Test123!") {
                setCookie(null, 'token', token, {
                    maxAge: 30 * 24 * 60 * 60,
                    path: '/',
                });
                toast.success("Giriş Başarılı", {
                    description: "Yönetim paneline yönlendiriliyorsunuz...",
                });
                router.push("/crm");
            } else {
                toast.error("Giriş Başarısız", {
                    description: "Kullanıcı adı veya şifre hatalı.",
                });
            }
        } catch (error) {
            toast.error("Sistem Hatası", {
                description: "Geçici olarak giriş yapılamıyor, lütfen daha sonra tekrar deneyin.",
            });
        }
    }

    return (
        <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
                <h1 className="text-3xl font-bold tracking-tight">Hoş Geldiniz</h1>
                <p className="text-sm text-muted-foreground">
                    Sisteme giriş yapmak için şirket e-posta adresinizi kullanın.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-5">
                <div className="space-y-2 relative group">
                    <Label htmlFor="email" className={`text-xs font-semibold uppercase tracking-wider ${errors.email ? "text-destructive" : "text-muted-foreground"}`}>E-Posta Adresi</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="osmanaliaydemir@hotmail.com"
                            className={`h-11 pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ${errors.email ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}
                            {...register("email")}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2 relative group">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className={`text-xs font-semibold uppercase tracking-wider ${errors.password ? "text-destructive" : "text-muted-foreground"}`}>Şifre</Label>
                        <Link
                            href="/forgot-password"
                            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Şifremi Unuttum?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`h-11 pl-10 pr-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ${errors.password ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}
                            {...register("password")}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-9 w-9 text-muted-foreground hover:bg-transparent hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.password && (
                        <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.password.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full h-12 font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group" disabled={isSubmitting}>
                    {isSubmitting ? "Giriş Yapılıyor..." : (
                        <span className="flex items-center gap-2">
                            Giriş Yap <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    )}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                Sistem erişimi yetkiniz yok mu?{" "}
                <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    Yetki Talep Edin
                </Link>
            </div>
        </div>
    )
}
