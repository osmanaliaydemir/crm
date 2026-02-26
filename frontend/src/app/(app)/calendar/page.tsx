"use client"

import { CalendarView } from "@/components/calendar-view"
import { PageWrapper } from "@/components/page-wrapper"

export default function CalendarPage() {
    return (
        <PageWrapper className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">İş Takvimi</h1>
                <p className="text-muted-foreground">
                    Projeler, teslimatlar ve önemli satış randevularını tek bir yerden takip edin.
                </p>
            </div>

            <CalendarView />
        </PageWrapper>
    )
}
