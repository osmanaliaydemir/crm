"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

interface KpiCardProps {
    title: string
    value: string
    description: string
    icon: LucideIcon
    trendData: { value: number }[]
    color: string
    delay?: number
}

export function KpiCard({ title, value, description, icon: Icon, trendData, color, delay = 0 }: KpiCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 group relative">
                <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                    <Icon className={`h-24 w-24 ${color}`} />
                </div>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                            <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${color} bg-opacity-10 border border-current border-opacity-20`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                    </div>

                    <div className="flex items-end justify-between gap-4 mt-6">
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                {description}
                            </p>
                        </div>
                        <div className="h-10 w-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={color.includes('blue') ? '#3b82f6' : color.includes('green') ? '#22c55e' : color.includes('orange') ? '#f97316' : '#8b5cf6'}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

