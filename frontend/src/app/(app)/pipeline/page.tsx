"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, MoreHorizontal, GripVertical, Calendar, DollarSign, User, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageWrapper, fadeInUp } from "@/components/page-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Dnd Kit Imports
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    useDroppable
} from "@dnd-kit/core"
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { createPortal } from "react-dom"

const dealSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2, "Fırsat adı en az 2 karakter olmalıdır."),
    customer: z.string().min(2, "Müşteri adı gereklidir."),
    value: z.coerce.number().min(0, "Tutar 0'dan küçük olamaz."),
    expectedClose: z.string().min(2, "Kapanış tarihi gereklidir."),
    probability: z.string().min(1, "Olasılık değeri gereklidir."),
    assignee: z.string().min(2, "Sorumlu kısa adı gereklidir."),
    columnId: z.string().min(1, "Aşama seçimi zorunludur."),
})

type DealFormValues = z.infer<typeof dealSchema>

const initialColumns = [
    {
        id: "col-1",
        title: "Potansiyel (Lead)",
        color: "border-l-4 border-l-blue-500",
        deals: [
            {
                id: "d-1",
                title: "ERP Modernizasyon",
                customer: "TechCorp A.Ş.",
                value: 150000,
                expectedClose: "15 Kas",
                probability: "20",
                assignee: "OA",
                columnId: "col-1",
                ageInDays: 45 // Sıcaklık ölçeği için
            },
            {
                id: "d-2",
                title: "Bulut Yedekleme Altyapısı",
                customer: "SecureData Ltd.",
                value: 45000,
                expectedClose: "20 Eki",
                probability: "30",
                assignee: "ZA",
                columnId: "col-1",
                ageInDays: 12
            }
        ]
    },
    {
        id: "col-2",
        title: "Görüşme (Qualified)",
        color: "border-l-4 border-l-yellow-500",
        deals: [
            {
                id: "d-3",
                title: "E-Ticaret Entegrasyonu",
                customer: "Can Tekstil",
                value: 85000,
                expectedClose: "10 Eki",
                probability: "50",
                assignee: "OA",
                columnId: "col-2"
            }
        ]
    },
    {
        id: "col-3",
        title: "Teklif Sunuldu",
        color: "border-l-4 border-l-orange-500",
        deals: [
            {
                id: "d-4",
                title: "50 Kullanıcılı CRM Lisansı",
                customer: "Global Lojistik",
                value: 120000,
                expectedClose: "05 Eki",
                probability: "80",
                assignee: "MK",
                columnId: "col-3"
            }
        ]
    },
    {
        id: "col-4",
        title: "Kazanıldı (Won)",
        color: "border-l-4 border-l-green-500",
        deals: [
            {
                id: "d-6",
                title: "Ağ Altyapısı Yenileme",
                customer: "Acme Corp",
                value: 350000,
                expectedClose: "Bugün",
                probability: "100",
                assignee: "ZA",
                columnId: "col-4"
            }
        ]
    }
]

// --- DND Components ---

function DealCardContent({ deal, onEdit, onDelete }: any) {
    const getHeatColor = (age: number) => {
        if (age > 30) return "bg-red-500" // Çok eski, kritik (Sıcak/Yanıyor)
        if (age > 15) return "bg-orange-500" // Orta yaşlı
        return "bg-blue-500" // Yeni (Taze)
    }

    return (
        <Card className="shadow-sm border overflow-hidden hover:shadow-md hover:ring-1 hover:ring-primary/20 hover:-translate-y-0.5 transition-all group relative bg-linear-to-b from-background to-muted/10 h-full">
            {/* Heat Map Indicator */}
            <div className={`absolute right-0 top-0 bottom-0 w-1 ${getHeatColor(deal.ageInDays || 0)} opacity-80`} />

            <div className={`absolute left-1 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity text-primary/50 cursor-grab active:cursor-grabbing`}>
                <GripVertical className="h-4 w-4" />
            </div>
            {deal.columnId === "col-4" && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
            )}
            <CardHeader className="p-4 pb-2 pl-6">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm font-medium leading-tight whitespace-normal wrap-break-word">
                        {deal.title}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-2 shrink-0 hover:bg-primary/10 hover:text-primary transition-colors">
                                <span className="sr-only">Menü</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(deal)}>Düzenle</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert("Müşteri detay yapım aşamasında")}>Müşteriye Git</DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10"
                                onClick={() => onDelete(deal)}
                            >
                                Sil / İptal Et
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 pl-6 space-y-3">
                <div className="flex items-center text-xs text-muted-foreground">
                    <User className="mr-1 h-3 w-3 shrink-0" />
                    <span className="truncate">{deal.customer}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center font-bold text-primary">
                        <DollarSign className="mr-0.5 h-3.5 w-3.5" />
                        {deal?.value?.toLocaleString?.('tr-TR') || "0"}
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                        %{deal.probability}
                    </Badge>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 pl-6 flex justify-between items-center border-t border-dashed mt-2 bg-muted/10 rounded-b-xl">
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Calendar className="mr-1 h-3 w-3" />
                    {deal.expectedClose}
                </div>
                <Avatar className="h-6 w-6 mt-2">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {deal.assignee}
                    </AvatarFallback>
                </Avatar>
            </CardFooter>
        </Card>
    )
}

function SortableDeal({ deal, onEdit, onDelete }: any) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: deal.id,
        data: { type: "Deal", deal },
    })

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    }

    if (isDragging) {
        return <div ref={setNodeRef} style={style} className="h-[140px] w-full rounded-xl border-2 border-primary/50 bg-primary/10 border-dashed opacity-50" />
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab relative z-10 active:z-50 active:cursor-grabbing touch-none">
            <DealCardContent deal={deal} onEdit={onEdit} onDelete={onDelete} />
        </div>
    )
}

function DroppableColumn({ column, onAddClick, onEdit, onDelete }: any) {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: { type: "Column", column },
    })

    return (
        <div ref={setNodeRef} className="flex flex-col gap-3 w-[320px] shrink-0 h-full">
            {/* Kolon Başlığı */}
            <div className={`flex items-center justify-between p-3 bg-background rounded-lg border shadow-sm ${column.color} ${column.id === "col-4" ? "bg-green-500/5 ring-1 ring-green-500/20" : ""}`}>
                <div className="flex items-center gap-2">
                    {column.id === "col-4" && <CheckCircle2 className="h-4 w-4 text-green-600 animate-pulse" />}
                    <span className="font-semibold text-sm">{column.title}</span>
                    <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                        {column.deals.length}
                    </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAddClick(column.id)}>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>

            {/* Fırsat Kartları */}
            <SortableContext items={column.deals.map((d: any) => d.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3 flex-1">
                    {column.deals.map((deal: any) => (
                        <SortableDeal key={deal.id} deal={deal} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                    {column.deals.length === 0 && (
                        <div key={`empty-${column.id}`} className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground/60 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer min-h-[120px]" onClick={() => onAddClick(column.id)}>
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 transition-colors">
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium">Yeni fırsat ekle</span>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    )
}

export default function PipelinePage() {
    const [columns, setColumns] = useState(initialColumns)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingDeal, setEditingDeal] = useState<DealFormValues | null>(null)
    const [dealToDelete, setDealToDelete] = useState<{ id: string, columnId: string } | null>(null)
    const [automationDeal, setAutomationDeal] = useState<any | null>(null)
    const [isAutomationOpen, setIsAutomationOpen] = useState(false)

    // Dnd States
    const [activeDeal, setActiveDeal] = useState<any | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const form = useForm<DealFormValues>({
        resolver: zodResolver(dealSchema) as any,
        defaultValues: {
            title: "",
            customer: "",
            value: 0,
            expectedClose: "",
            probability: "20",
            assignee: "OA",
            columnId: "col-1"
        }
    })

    const handleAddClick = (columnId?: string) => {
        setEditingDeal(null)
        form.reset({
            title: "",
            customer: "",
            value: 0,
            expectedClose: "",
            probability: "20",
            assignee: "OA",
            columnId: columnId || "col-1"
        })
        setIsDialogOpen(true)
    }

    const handleEditClick = (deal: any) => {
        setEditingDeal(deal)
        form.reset({
            id: deal.id,
            title: deal.title,
            customer: deal.customer,
            value: deal.value,
            expectedClose: deal.expectedClose,
            probability: deal.probability,
            assignee: deal.assignee,
            columnId: deal.columnId
        })
        setIsDialogOpen(true)
    }

    const onSubmit = (data: DealFormValues) => {
        if (editingDeal) {
            // Edit
            const updatedColumns = columns.map(col => {
                // If it was in this column but moved to another
                if (col.id === editingDeal.columnId && col.id !== data.columnId) {
                    return { ...col, deals: col.deals.filter(d => d.id !== editingDeal.id) }
                }
                // If it was moved to this column
                if (col.id === data.columnId && editingDeal.columnId !== data.columnId) {
                    const newDeal = { ...data, id: editingDeal.id || `d-${Date.now()}` }
                    return { ...col, deals: [...col.deals, newDeal as any] }
                }
                // If it stayed in the same column
                if (col.id === data.columnId && editingDeal.columnId === data.columnId) {
                    return { ...col, deals: col.deals.map(d => d.id === editingDeal.id ? { ...data, id: editingDeal.id } as any : d) }
                }
                return col
            })
            setColumns(updatedColumns)
            toast.success("Fırsat Güncellendi", { description: `${data.title} başarıyla güncellendi.` })
        } else {
            // Add
            const newDeal = {
                ...data,
                id: `d-${Date.now()}`
            }
            const updatedColumns = columns.map(col => {
                if (col.id === data.columnId) {
                    return { ...col, deals: [newDeal as any, ...col.deals] }
                }
                return col
            })
            setColumns(updatedColumns)
            toast.success("Fırsat Eklendi", { description: `${data.title} Kanban panosuna eklendi.` })
        }
        setIsDialogOpen(false)
    }

    const confirmDelete = () => {
        if (dealToDelete) {
            const updatedColumns = columns.map(col => {
                if (col.id === dealToDelete.columnId) {
                    return { ...col, deals: col.deals.filter(d => d.id !== dealToDelete.id) }
                }
                return col
            })
            setColumns(updatedColumns)
            setDealToDelete(null)
            toast.success("Fırsat Silindi", { description: "Kayıt başarıyla kaldırıldı." })
        }
    }

    // Dnd Handlers
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        if (active.data.current?.type === "Deal") {
            setActiveDeal(active.data.current.deal)
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id
        if (activeId === overId) return

        const activeData = active.data.current
        const overData = over.data.current
        if (!activeData || !overData) return

        // Deal -> Deal (sorting or moving columns)
        if (activeData.type === "Deal" && overData.type === "Deal") {
            const activeColId = activeData.deal.columnId
            const overColId = overData.deal.columnId

            if (activeColId !== overColId) {
                setColumns(cols => {
                    const activeColIndex = cols.findIndex(c => c.id === activeColId)
                    const overColIndex = cols.findIndex(c => c.id === overColId)

                    const newCols = [...cols]
                    const activeDealIndex = newCols[activeColIndex].deals.findIndex(d => d.id === activeId)

                    // Modify columnId of the deal
                    const movingDeal = { ...newCols[activeColIndex].deals[activeDealIndex], columnId: overColId }

                    newCols[activeColIndex].deals.splice(activeDealIndex, 1)

                    const overDealIndex = newCols[overColIndex].deals.findIndex(d => d.id === overId)
                    newCols[overColIndex].deals.splice(overDealIndex, 0, movingDeal as any)

                    // Automation trigger for Deal -> Deal cross column
                    if (overColId === "col-4" && activeColId !== "col-4") {
                        setAutomationDeal(movingDeal)
                        setIsAutomationOpen(true)
                    }

                    return newCols
                })
            } else {
                setColumns(cols => {
                    const colIndex = cols.findIndex(c => c.id === activeColId)
                    const newCols = [...cols]
                    const oldIndex = newCols[colIndex].deals.findIndex(d => d.id === activeId)
                    const newIndex = newCols[colIndex].deals.findIndex(d => d.id === overId)
                    newCols[colIndex].deals = arrayMove(newCols[colIndex].deals, oldIndex, newIndex)
                    return newCols
                })
            }
        }

        // Deal -> Empty Column
        if (activeData.type === "Deal" && overData.type === "Column") {
            const activeColId = activeData.deal.columnId
            const overColId = overData.column.id
            if (activeColId !== overColId) {
                setColumns(cols => {
                    const activeColIndex = cols.findIndex(c => c.id === activeColId)
                    const overColIndex = cols.findIndex(c => c.id === overColId)

                    const newCols = [...cols]
                    const activeDealIndex = newCols[activeColIndex].deals.findIndex(d => d.id === activeId)

                    const movingDeal = { ...newCols[activeColIndex].deals[activeDealIndex], columnId: overColId }
                    newCols[activeColIndex].deals.splice(activeDealIndex, 1)

                    newCols[overColIndex].deals.push(movingDeal as any)

                    // Automation trigger
                    if (overColId === "col-4") {
                        setAutomationDeal(movingDeal)
                        setIsAutomationOpen(true)
                    }

                    return newCols
                })
            }
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDeal(null)
    }

    // Toplam bakiyeyi otomatik hesaplama
    const totalPipelineValue = columns.flatMap(c => c.deals).reduce((acc, deal) => acc + deal.value, 0)

    if (!mounted) return null;

    return (
        <PageWrapper className="flex flex-col h-[calc(100vh-5rem)] gap-4">
            {/* Sayfa Başlığı ve Aksiyonlar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Satış Fırsatları</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Satış süreçlerini Kanban panosu üzerinde sürükleyip bırakarak yönetin.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 mr-4 text-sm font-medium">
                        <span className="text-muted-foreground">Toplam Boru Hattı Değeri:</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">₺{totalPipelineValue.toLocaleString('tr-TR')}</span>
                    </div>
                    <Button onClick={() => handleAddClick()} className="group transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20 hover:ring-offset-2">
                        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
                        Yeni Fırsat Ekle
                    </Button>
                </div>
            </div>

            {/* Kanban Board Area */}
            <ScrollArea className="flex-1 w-full whitespace-nowrap rounded-lg border bg-muted/30">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex h-full w-max p-4 gap-6 items-start">
                        {columns.map((column) => (
                            <DroppableColumn
                                key={column.id}
                                column={column}
                                onAddClick={handleAddClick}
                                onEdit={handleEditClick}
                                onDelete={(deal: any) => setDealToDelete({ id: deal.id, columnId: deal.columnId })}
                            />
                        ))}
                    </div>
                    {typeof document !== 'undefined' && createPortal(
                        <DragOverlay>
                            {activeDeal ? (
                                <div className="opacity-90 rotate-2 scale-105 transition-transform shadow-2xl cursor-grabbing">
                                    <DealCardContent deal={activeDeal} onEdit={() => { }} onDelete={() => { }} />
                                </div>
                            ) : null}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* DEAL CREATE / EDIT DIALOG */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingDeal ? 'Fırsatı Düzenle' : 'Yeni Fırsat Ekle'}</DialogTitle>
                        <DialogDescription>
                            Pipeline aşamaları arasında müşterinizin potansiyel iş tekliflerini takip edin.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fırsat Adı / Açıklaması</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Örn: ERP Modernizasyon" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="customer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Müşteri</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Firma veya kişi ara..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Beklenen Tutar (₺)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="probability"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Olasılık (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" max="100" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="expectedClose"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tahmini Kapanış</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Örn: 15 Kas" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="assignee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sorumlu (Kısa Kod)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="OA, ZA vb." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="columnId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bulunduğu Aşama</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Aşama seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {columns.map(col => (
                                                    <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full">{editingDeal ? 'Değişiklikleri Kaydet' : 'Fırsatı Ekle'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* DELETE ALERT DIALOG */}
            <AlertDialog open={!!dealToDelete} onOpenChange={(val) => !val && setDealToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Kayıt Silinecek</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu fırsatı silmek istediğinize emin misiniz? Fırsatın potansiyel değeri raporlardan eksilecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Fırsatı Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* AUTOMATION DIALOG */}
            <Dialog open={isAutomationOpen} onOpenChange={setIsAutomationOpen}>
                <DialogContent className="sm:max-w-[500px] border-green-500/20 shadow-2xl">
                    <DialogHeader className="flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold">Tebrikler! Satış Kazanıldı</DialogTitle>
                            <DialogDescription className="text-base mt-2">
                                <span className="font-semibold text-foreground">"{automationDeal?.title}"</span> fırsatı başarıyla kazanıldı. Bu fırsatı bir operasyonel projeye dönüştürmek ister misiniz?
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3 mt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Müşteri:</span>
                            <span className="font-medium">{automationDeal?.customer}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Proje Değeri:</span>
                            <span className="font-bold text-green-600">₺{automationDeal?.value?.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Önerilen Başlangıç:</span>
                            <span className="font-medium">Bugün</span>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
                        <Button variant="outline" onClick={() => setIsAutomationOpen(false)} className="sm:flex-1">
                            Sadece Kaydet
                        </Button>
                        <Button
                            onClick={() => {
                                setIsAutomationOpen(false)
                                toast.success("Proje Oluşturuldu", {
                                    description: "Operasyon ekibine bildirim gönderildi ve proje sayfası hazırlandı.",
                                })
                            }}
                            className="sm:flex-1 bg-green-600 hover:bg-green-700"
                        >
                            Proje Olarak Başlat
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    )
}
