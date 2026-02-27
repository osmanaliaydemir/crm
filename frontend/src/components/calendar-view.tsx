"use client"

import * as React from "react"
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Bell,
    Clock,
    Briefcase,
    CheckCircle2,
    Users,
    Trash2,
    Edit3
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, useAddAttendee, useRemoveAttendee } from "@/hooks/api/use-calendar"
import { useUsers } from "@/hooks/api/use-users"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Event {
    id: string
    title: string
    date: Date
    type: "project" | "deal" | "meeting"
    description: string
    manager: string
    managerId: string
    attendees: any[]
}

export function CalendarView() {
    const today = new Date()
    const [currentDate, setCurrentDate] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1))
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(today)

    // API Hooks
    const { data: rawEvents = [], isLoading } = useEvents()
    const { data: employees = [] } = useUsers()
    const { mutate: addEvent } = useCreateEvent()
    const { mutate: updateEvent } = useUpdateEvent()
    const { mutate: deleteEvent } = useDeleteEvent()
    const { mutate: addAttendeeMutation } = useAddAttendee()
    const { mutate: removeAttendeeMutation } = useRemoveAttendee()

    // Normalize DB data to local mapped structure
    const events: Event[] = rawEvents.map((e: any) => ({
        id: e.id,
        title: e.title,
        date: new Date(e.startDate),
        type: e.type === "Proje" ? "project" : e.type === "Satış" ? "deal" : "meeting",
        description: e.description || "",
        manager: e.userName || "Atanmadı",
        managerId: e.userId,
        attendees: e.attendees || []
    }))

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [editingEvent, setEditingEvent] = React.useState<Event | null>(null)

    // Form states
    const [formTitle, setFormTitle] = React.useState("")
    const [formDesc, setFormDesc] = React.useState("")
    const [formType, setFormType] = React.useState<"project" | "deal" | "meeting">("meeting")
    const [formManagerId, setFormManagerId] = React.useState("")
    const [selectedAttendeeId, setSelectedAttendeeId] = React.useState("")

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const emptyDays = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i)

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

    const monthName = currentDate.toLocaleString('tr-TR', { month: 'long' })
    const year = currentDate.getFullYear()

    const getEventsForDay = (day: number) => {
        return events.filter(event =>
            event.date.getDate() === day &&
            event.date.getMonth() === currentDate.getMonth() &&
            event.date.getFullYear() === currentDate.getFullYear()
        )
    }

    const selectedEvents = selectedDate
        ? events.filter(event =>
            event.date.getDate() === selectedDate.getDate() &&
            event.date.getMonth() === selectedDate.getMonth() &&
            event.date.getFullYear() === selectedDate.getFullYear()
        )
        : []

    const handleOpenAddDialog = () => {
        setEditingEvent(null)
        setFormTitle("")
        setFormDesc("")
        setFormType("meeting")
        setFormManagerId("")
        setIsDialogOpen(true)
    }

    const handleOpenEditDialog = (event: Event) => {
        setEditingEvent(event)
        setFormTitle(event.title)
        setFormDesc(event.description)
        setFormType(event.type)
        setFormManagerId(event.managerId)
        setIsDialogOpen(true)
    }

    const handleSave = () => {
        if (!formTitle.trim()) {
            toast.error("Başlık boş olamaz!")
            return
        }

        const backendType = formType === "project" ? "Proje" : formType === "deal" ? "Satış" : "Toplantı"
        const eventDate = selectedDate || new Date()
        const startIso = eventDate.toISOString()
        const endIso = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString() // 1 hour later

        if (editingEvent) {
            // Edit
            updateEvent({
                id: editingEvent.id,
                title: formTitle,
                description: formDesc,
                type: backendType,
                startDate: startIso,
                endDate: endIso
            }, {
                onSuccess: () => setIsDialogOpen(false)
            })
        } else {
            // Add
            addEvent({
                title: formTitle,
                description: formDesc,
                type: backendType,
                startDate: startIso,
                endDate: endIso
            }, {
                onSuccess: () => setIsDialogOpen(false)
            })
        }
    }

    const handleDelete = (id: string) => {
        deleteEvent(id, {
            onSuccess: () => setIsDialogOpen(false)
        })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3 border-none shadow-md bg-linear-to-b from-background to-muted/10">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">{monthName} {year}</CardTitle>
                            <p className="text-xs text-muted-foreground">İş takvimi ve teslimat planı</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                            const today = new Date();
                            setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
                            setSelectedDate(today);
                        }} className="h-8">
                            Bugün
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-7 border-b bg-muted/30">
                        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                            <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 min-h-[600px]">
                        {emptyDays.map(i => (
                            <div key={`empty-${i}`} className="border-r border-b bg-muted/5 opacity-50" />
                        ))}
                        {days.map(day => {
                            const dayEvents = getEventsForDay(day)
                            const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth()

                            const isToday = day === today.getDate() &&
                                currentDate.getMonth() === today.getMonth() &&
                                currentDate.getFullYear() === today.getFullYear()

                            return (
                                <div
                                    key={day}
                                    className={cn(
                                        "border-r border-b p-2 transition-all cursor-pointer hover:bg-muted/30 group relative",
                                        isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20",
                                        isToday && "bg-blue-50/50"
                                    )}
                                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                                    onDoubleClick={handleOpenAddDialog}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={cn(
                                            "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full transition-colors",
                                            isSelected ? "bg-primary text-primary-foreground" : "text-foreground group-hover:bg-muted/50",
                                            isToday && !isSelected && "border border-blue-500 text-blue-600"
                                        )}>
                                            {day}
                                        </span>
                                    </div>
                                    <div className="space-y-1 overflow-hidden">
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenEditDialog(event);
                                                }}
                                                className={cn(
                                                    "text-[10px] p-1.5 rounded-md border truncate shadow-xs transition-transform hover:scale-[1.02]",
                                                    event.type === "project" ? "bg-green-500/10 border-green-500/20 text-green-700 font-medium" :
                                                        event.type === "deal" ? "bg-blue-500/10 border-blue-500/20 text-blue-700 font-medium" :
                                                            "bg-orange-500/10 border-orange-500/20 text-orange-700 font-medium"
                                                )}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="border shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                            <Clock className="h-4 w-4" />
                            {selectedDate?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedEvents.length > 0 ? (
                            <div className="space-y-4">
                                {selectedEvents.map(event => (
                                    <div key={event.id} className="p-3 rounded-lg border bg-muted/5 space-y-2 group relative">
                                        <div className="flex items-center justify-between">
                                            <Badge variant={event.type === "project" ? "default" : "secondary"}>
                                                {event.type === "project" ? "Proje" : event.type === "deal" ? "Satış" : "Toplantı"}
                                            </Badge>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleOpenEditDialog(event)}
                                                >
                                                    <Edit3 className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-red-500 hover:text-red-600"
                                                    onClick={() => handleDelete(event.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <h5 className="text-sm font-semibold">{event.title}</h5>
                                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                                            "{event.description}"
                                        </p>
                                        <div className="space-y-2 pt-2 border-t mt-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-[10px] text-muted-foreground font-medium">{event.manager}</span>
                                                </div>
                                                {event.attendees.length > 0 && (
                                                    <div className="flex -space-x-2">
                                                        {event.attendees.map((a: any) => (
                                                            <Avatar key={a.id} className="h-5 w-5 border-2 border-background group/avatar relative">
                                                                <AvatarFallback className="text-[8px]">{a.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeAttendeeMutation(a.id);
                                                                    }}
                                                                    className="absolute inset-0 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 className="h-2 w-2 text-white" />
                                                                </button>
                                                            </Avatar>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Attendee Adder */}
                                            <div className="flex gap-1 items-center" onClick={(e) => e.stopPropagation()}>
                                                <Select value={selectedAttendeeId} onValueChange={setSelectedAttendeeId}>
                                                    <SelectTrigger className="h-6 text-[10px] py-0 px-2 flex-1">
                                                        <SelectValue placeholder="Katılımcı Seç" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {employees.filter(emp => !event.attendees.some((a: any) => a.userId === emp.id)).map(emp => (
                                                            <SelectItem key={emp.id} value={emp.id} className="text-[10px]">{emp.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    size="icon"
                                                    className="h-6 w-6 shrink-0"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        if (!selectedAttendeeId) return;
                                                        addAttendeeMutation({ eventId: event.id, userId: selectedAttendeeId });
                                                        setSelectedAttendeeId("");
                                                    }}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={handleOpenAddDialog}>
                                    <Plus className="h-3 w-3 mr-1" /> Başka Kayıt Ekle
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8 space-y-2">
                                <div className="mx-auto bg-muted rounded-full h-10 w-10 flex items-center justify-center opacity-40">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <p className="text-xs text-muted-foreground">Bu tarih için kayıtlı etkinlik bulunmuyor.</p>
                                <Button variant="outline" size="sm" className="w-full mt-2 text-[10px] h-8" onClick={handleOpenAddDialog}>
                                    <Plus className="h-3 w-3 mr-1" /> Yeni Kayıt Ekle
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" />
                            Yaklaşan Önemli İşler
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {events.slice(0, 5).map(event => (
                                <div
                                    key={event.id}
                                    className="p-4 flex items-center gap-3 hover:bg-muted/20 transition-colors cursor-pointer group"
                                    onClick={() => {
                                        setCurrentDate(new Date(event.date.getFullYear(), event.date.getMonth(), 1));
                                        setSelectedDate(event.date);
                                    }}
                                >
                                    <div className={cn(
                                        "h-2 w-2 rounded-full shrink-0",
                                        event.type === "project" ? "bg-green-500" : event.type === "deal" ? "bg-blue-500" : "bg-orange-500"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{event.title}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {event.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Event Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? "Etkinliği Düzenle" : "Yeni Etkinlik Ekle"}</DialogTitle>
                        <DialogDescription>
                            {selectedDate?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} tarihi için etkinlik bilgileri.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Etkinlik Başlığı</Label>
                            <Input
                                id="title"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="Örn: Müşteri Sunumu"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Etkinlik Tipi</Label>
                            <Select value={formType} onValueChange={(v: any) => setFormType(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tip seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="project">Proje Teslimat</SelectItem>
                                    <SelectItem value="deal">Satış / Fırsat</SelectItem>
                                    <SelectItem value="meeting">Toplantı / Randevu</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="manager">Sorumlu</Label>
                            <Select value={formManagerId} onValueChange={setFormManagerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Personel seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <Input
                                id="description"
                                value={formDesc}
                                onChange={(e) => setFormDesc(e.target.value)}
                                placeholder="Kısa detaylar..."
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between items-center sm:justify-between">
                        {editingEvent && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => handleDelete(editingEvent.id)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" /> Sil
                            </Button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                            <Button onClick={handleSave}>{editingEvent ? "Güncelle" : "Kaydet"}</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
