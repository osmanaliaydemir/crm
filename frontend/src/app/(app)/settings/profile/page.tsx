"use client"

import { useState } from "react"
import { User, Key, Shield, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/page-wrapper"

export default function ProfileSettingsPage() {
    return (
        <PageWrapper className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Kişisel Bilgiler & Güvenlik</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Hesabınıza ait kişisel profilinizi, şifrenizi ve çok faktörlü doğrulama (2FA) ayarlarınızı yönetin.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Sol Kolon - Avatar ve Özet */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-linear-to-b from-background to-muted/10">
                        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                            <div className="relative group cursor-pointer">
                                <Avatar className="h-24 w-24 border-4 border-background">
                                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">OA</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-white font-medium">Değiştir</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Osman Ali</h3>
                                <p className="text-sm text-muted-foreground">Super Admin</p>
                                <Badge variant="secondary" className="mt-2 font-normal">Bilgi İşlem / Yönetim</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sağ Kolon - Detaylar ve Güvenlik */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Profil Detayları
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Ad</label>
                                    <Input defaultValue="Osman" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Soyad</label>
                                    <Input defaultValue="Ali" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">E-Posta Adresi (Kullanıcı Adı)</label>
                                <Input defaultValue="osman@universal.com" disabled className="bg-muted/50" />
                                <p className="text-xs text-muted-foreground">E-posta adresi değişikliği için sistem yöneticisine başvurun.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Telefon Numarası</label>
                                <Input defaultValue="+90 (555) 123 45 67" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/20 pt-4 flex justify-end">
                            <Button>Değişiklikleri Kaydet</Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                Şifre Değiştirme
                            </CardTitle>
                            <CardDescription>Hesabınızın güvenliği için düzenli aralıklarla şifrenizi yenileyin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mevcut Şifre</label>
                                <Input type="password" placeholder="••••••••" />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Yeni Şifre</label>
                                <Input type="password" placeholder="••••••••" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Yeni Şifre (Tekrar)</label>
                                <Input type="password" placeholder="••••••••" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/20 pt-4 flex justify-end">
                            <Button variant="secondary">Şifreyi Güncelle</Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-sm border-primary/20">
                        <CardHeader className="bg-primary/5 pb-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                İki Aşamalı Doğrulama (2FA)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <div className="mt-1 p-2 bg-muted rounded-md shrink-0">
                                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">Authenticator Uygulaması</h4>
                                        <p className="text-sm text-muted-foreground max-w-[400px]">
                                            Giriş yaparken şifrenize ek olarak Google Authenticator veya Microsoft Authenticator üzerinden üretilen anlık kodu girin.
                                        </p>
                                    </div>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            {/* If active show this: */}
                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                2FA doğrulaması hesabınız için aktif durumda.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageWrapper>
    )
}
