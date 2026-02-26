"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function StatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-[60px] mb-2" />
                        <Skeleton className="h-3 w-[120px]" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[300px]" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-[100px]" />
                    <Skeleton className="h-10 w-[100px]" />
                </div>
            </div>
            <Card className="border shadow-none overflow-hidden">
                <div className="border-b p-4">
                    <Skeleton className="h-6 w-[200px]" />
                </div>
                <div className="p-0">
                    <div className="space-y-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center space-x-4 p-4 border-b last:border-0">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-[40%]" />
                                    <Skeleton className="h-3 w-[30%]" />
                                </div>
                                <Skeleton className="h-4 w-[10%]" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export function KanbanSkeleton() {
    return (
        <div className="flex h-full w-max p-4 gap-6 items-start">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[320px] flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <Skeleton className="h-6 w-[120px]" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((j) => (
                            <Card key={j} className="border shadow-none p-4 space-y-3">
                                <Skeleton className="h-4 w-[80%]" />
                                <Skeleton className="h-3 w-[60%]" />
                                <div className="flex justify-between items-center pt-2">
                                    <Skeleton className="h-4 w-[60px]" />
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export function TimelineSkeleton() {
    return (
        <div className="space-y-8 relative ml-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1 pt-1">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-3 w-[50px]" />
                        </div>
                        <Skeleton className="h-3 w-[90%]" />
                    </div>
                </div>
            ))}
        </div>
    )
}
