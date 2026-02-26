"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import { Plus, Search, SlidersHorizontal, Phone, Mail, MessageSquare } from "lucide-react"

import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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

import { Customer, Interaction, CustomerFile } from "@/types/crm"
import { CustomerFormValues } from "@/schemas/crm"
import { CustomerTable } from "./components/customer-table"
import { CustomerSheet } from "./components/customer-sheet"
import { CustomerFilterDrawer } from "./components/customer-filter-drawer"
import { TableSkeleton } from "@/components/ui/table-skeleton"

import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/api/use-crm"

// TODO: Gerçek endpoint'ler yazıldığında query üzerinden çekilecek
const interactionsMock: Interaction[] = [
    {
        id: "int-1",
        customerId: "CUS-1001",
        type: "Call",
        title: "Tanışma Toplantısı",
        description: "Yeni ERP projesi hakkında detaylar konuşuldu.",
        date: "24 Şub 2024, 14:20",
        icon: <Phone className="h-4 w-4" />,
        color: "bg-blue-500"
    },
    {
        id: "int-2",
        customerId: "CUS-1001",
        type: "Email",
        title: "Teklif Gönderildi",
        description: "Yıllık bakım ve destek lisansı e-posta ile iletildi.",
        date: "25 Şub 2024, 09:15",
        icon: <Mail className="h-4 w-4" />,
        color: "bg-orange-500"
    },
    {
        id: "int-3",
        customerId: "CUS-1001",
        type: "Note",
        title: "Ofis Ziyareti Notu",
        description: "Müşteri bulut entegrasyonuna sıcak bakıyor.",
        date: "Bugün, 11:00",
        icon: <MessageSquare className="h-4 w-4" />,
        color: "bg-green-500"
    }
]

const filesMock: CustomerFile[] = [
    {
        id: "file-1",
        customerId: "CUS-1001",
        name: "Teklif_Dokumani_V2.pdf",
        size: "2.4 MB",
        date: "24 Şub 2024",
        type: "pdf"
    },
    {
        id: "file-2",
        customerId: "CUS-1001",
        name: "Satis_Sozlesmesi_Taslak.docx",
        size: "1.1 MB",
        date: "23 Şub 2024",
        type: "docx"
    }
]

export default function CRMPage() {
    const { data: customers = [], isLoading } = useCustomers()
    const { mutate: createCustomer } = useCreateCustomer()
    const { mutate: updateCustomer } = useUpdateCustomer()
    const { mutate: deleteCustomer } = useDeleteCustomer()

    const [searchTerm, setSearchTerm] = useState("")
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const toggleRow = (id: string) => {
        const newExpandedRows = new Set(expandedRows)
        if (newExpandedRows.has(id)) {
            newExpandedRows.delete(id)
        } else {
            newExpandedRows.add(id)
        }
        setExpandedRows(newExpandedRows)
    }

    // Sheet State
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<CustomerFormValues | null>(null)

    // Alert Dialog State (Delete)
    const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)

    // Basit Arama Filtrelemesi
    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.contactName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Opens Sheet for Edit
    const handleEditClick = (customer: Customer) => {
        setEditingCustomer({
            id: customer.id,
            name: customer.name,
            type: customer.type,
            contactName: customer.contactName,
            email: customer.email,
            phone: customer.phone,
            city: customer.city,
            status: customer.status,
            healthScore: customer.healthScore
        });
        setIsSheetOpen(true);
    }

    // Opens Sheet for Add
    const handleAddClick = () => {
        setEditingCustomer(null);
        setIsSheetOpen(true);
    }

    const onSubmit = (data: CustomerFormValues) => {
        if (editingCustomer) {
            updateCustomer({ id: editingCustomer.id!, data })
        } else {
            createCustomer(data)
        }
        setIsSheetOpen(false)
    }

    const confirmDelete = () => {
        if (customerToDelete) {
            deleteCustomer(customerToDelete)
            setCustomerToDelete(null)
        }
    }

    return (
        <PageWrapper className="flex flex-col h-full gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Müşteriler</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Müşteri ilişkileri yönetim (CRM) paneli üzerinden kişileri ve firmaları yönetebilirsiniz.
                    </p>
                </div>

                <Button className="flex items-center gap-2 group transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20 hover:ring-offset-2" onClick={handleAddClick}>
                    <Plus className="h-4 w-4 transition-transform group-hover:scale-125" />
                    Yeni Müşteri Ekle
                </Button>
            </div>

            <Card className="border shadow-md bg-linear-to-b from-background to-background/50 overflow-hidden">
                <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/10">
                    <div className="relative w-full sm:max-w-md transition-all focus-within:ring-2 focus-within:ring-primary/20 rounded-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="İsim veya E-Posta Ara..."
                            className="pl-9 bg-muted/40 border-muted-foreground/20 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none transition-colors hover:bg-muted/60"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto flex items-center gap-2 hover:bg-primary/5 hover:text-primary transition-colors border-muted-foreground/20"
                        onClick={() => setIsFilterDrawerOpen(true)}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Gelişmiş Filtrele
                    </Button>
                </div>
                <CardContent className="p-0 relative min-h-[400px]">
                    {isLoading ? (
                        <div className="absolute inset-0 z-10 bg-background/50 flex p-4 justify-center backdrop-blur-[1px]">
                            <TableSkeleton columns={7} rows={5} />
                        </div>
                    ) : (
                        <CustomerTable
                            customers={filteredCustomers}
                            interactions={interactionsMock}
                            expandedRows={expandedRows}
                            toggleRow={toggleRow}
                            onEdit={handleEditClick}
                            onDelete={(id) => setCustomerToDelete(id)}
                        />
                    )}
                </CardContent>
            </Card>

            <CustomerFilterDrawer
                isOpen={isFilterDrawerOpen}
                onOpenChange={setIsFilterDrawerOpen}
                onApply={() => {
                    toast.info("Filtreler Uygulandı", { description: "Listeniz güncellendi." });
                    setIsFilterDrawerOpen(false);
                }}
            />

            <CustomerSheet
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                editingCustomer={editingCustomer}
                interactions={interactionsMock}
                files={filesMock}
                onSubmit={onSubmit}
            />

            <AlertDialog open={!!customerToDelete} onOpenChange={(o) => !o && setCustomerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Müşteriyi Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Müşteri kaydı, görüşme geçmişi ve dosyalar tamamen silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageWrapper>
    )
}
