"use client"

import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SmartGreeting() {
    const hours = new Date().getHours()
    const greeting = hours < 12 ? "Günaydın" : hours < 18 ? "İyi Günler" : "İyi Akşamlar"

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border bg-linear-to-br from-primary/5 via-primary/10 to-transparent p-8 mb-8"
        >
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="h-32 w-32 text-primary" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm tracking-wide uppercase">
                        <Zap className="h-4 w-4 fill-current" />
                        Günlük Özet & Yapay Zeka
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {greeting}, Osman! 👋
                    </h1>
                    <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
                        Bugün takibinde olan <span className="text-foreground font-semibold">3 fırsat</span> kritik aşamada ve tamamlanması gereken <span className="text-foreground font-semibold">2 acil görev</span> seni bekliyor.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all border-none">
                        Günün Planını Gör
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="rounded-full px-6 bg-background/50 backdrop-blur-sm">
                        AI Analizi İste
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
