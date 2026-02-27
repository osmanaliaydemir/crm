"use client"

import Link from "next/link"
import { Eye, EyeOff, Building, User, Mail, Lock, ArrowRight } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/services/auth.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const registerSchema = z.object({
    department: z.string().min(2, "Departman adı en az 2 karakter olmalıdır"),
    firstName: z.string().min(2, "Adınız en az 2 karakter olmalıdır"),
    lastName: z.string().min(2, "Soyadınız en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            await authService.register(data);

            toast.success("Kayıt Başarılı!", {
                description: "Hesabınız oluşturuldu. Giriş ekranına yönlendiriliyorsunuz...",
            })

            setTimeout(() => {
                router.push("/login")
            }, 1000)

        } catch (error: any) {
            const message = error.response?.data?.message || "Sistemde bir hata oluştu. Lütfen tekrar deneyin.";
            toast.error("Kayıt Başarısız", {
                description: message,
            })
        }
    }

    return (
        <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
                <h1 className="text-3xl font-bold tracking-tight">Sistem Hesabı Oluşturun</h1>
                <p className="text-sm text-muted-foreground">
                    Kurum içi panel hesabınızı oluşturmak için bilgilerinizi eksiksiz doldurun.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-5">

                <div className="space-y-2 relative group">
                    <Label htmlFor="department" className={`text-xs font-semibold uppercase tracking-wider ${errors.department ? "text-destructive" : "text-muted-foreground"}`}>Departman / Birim</Label>
                    <div className="relative">
                        <Building className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                        <Input
                            id="department"
                            placeholder="Örn: İnsan Kaynakları, Satış, IT"
                            className={`h-11 pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ${errors.department ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}
                            {...register("department")}
                        />
                    </div>
                    {errors.department && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.department.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative group">
                        <Label htmlFor="firstName" className={`text-xs font-semibold uppercase tracking-wider ${errors.firstName ? "text-destructive" : "text-muted-foreground"}`}>Adınız</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                            <Input
                                id="firstName"
                                placeholder="Ali"
                                className={`h-11 pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ${errors.firstName ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}
                                {...register("firstName")}
                            />
                        </div>
                        {errors.firstName && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.firstName.message}</p>}
                    </div>

                    <div className="space-y-2 relative group">
                        <Label htmlFor="lastName" className={`text-xs font-semibold uppercase tracking-wider ${errors.lastName ? "text-destructive" : "text-muted-foreground"}`}>Soyadınız</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                            <Input
                                id="lastName"
                                placeholder="Yılmaz"
                                className={`h-11 pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ${errors.lastName ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}
                                {...register("lastName")}
                            />
                        </div>
                        {errors.lastName && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.lastName.message}</p>}
                    </div>
                </div>

                <div className="space-y-2 relative group">
                    <Label htmlFor="email" className={`text-xs font-semibold uppercase tracking-wider ${errors.email ? "text-destructive" : "text-muted-foreground"}`}>İş E-Posta Adresiniz</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="ornek@sirketiniz.com"
                            className={`h-11 pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ${errors.email ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}
                            {...register("email")}
                        />
                    </div>
                    {errors.email && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2 relative group">
                    <Label htmlFor="password" className={`text-xs font-semibold uppercase tracking-wider ${errors.password ? "text-destructive" : "text-muted-foreground"}`}>Güçlü Şifre</Label>
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
                    {errors.password && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full h-12 font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group mt-2" disabled={isSubmitting}>
                    {isSubmitting ? "Hesap Oluşturuluyor..." : (
                        <span className="flex items-center gap-2">
                            Kaydı Tamamla & Başla <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    )}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                Zaten hesabınız var mı?{" "}
                <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    Giriş Yapın
                </Link>
            </div>
        </div>
    )
}
