"use client"

import { useState } from "react"
import { Plus, Search, Download, CreditCard, Wallet, Landmark, Building, FileText, Banknote, ClipboardList, Printer } from "lucide-react"
import { toast } from "sonner"

import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Transaction, TransactionStatus } from "@/types/finance"
import { TransactionFormValues } from "@/schemas/finance"

import { FinanceStats } from "./components/finance-stats"
import { TransactionTable } from "./components/transaction-table"
import { TransactionFormDialog } from "./components/transaction-form-dialog"
import { InvoiceGenerator } from "./components/invoice-generator"
import { TableSkeleton } from "@/components/ui/table-skeleton"

import { useTransactions, useCreateTransaction, useUpdateTransactionStatus, useDeleteTransaction } from "@/hooks/api/use-finance"

export default function FinancePage() {
    const { data: transactions = [], isLoading } = useTransactions()
    const { mutate: createTransaction } = useCreateTransaction()
    const { mutate: updateTransaction } = useUpdateTransactionStatus()
    const { mutate: deleteTransaction } = useDeleteTransaction()

    const [searchTerm, setSearchTerm] = useState("")

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [txToDelete, setTxToDelete] = useState<string | null>(null)

    // Bank Accounts State (Mock)
    const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
    const [newAccountData, setNewAccountData] = useState({ name: "", type: "bank", balance: "0", detail: "" })
    const [accounts, setAccounts] = useState([
        { id: 1, name: "Akbank Ticari", type: "bank", detail: "TR65 0000...", balance: 250500 },
        { id: 2, name: "Garanti POS BSMV", type: "credit", detail: "Kredi Kartı Bekleyen", balance: 82400 },
        { id: 3, name: "Merkez TL Kasa", type: "cash", detail: "Nakit", balance: 12300 }
    ])

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'bank': return <Landmark className="h-4 w-4" />
            case 'credit': return <CreditCard className="h-4 w-4" />
            case 'cash': return <Wallet className="h-4 w-4" />
            default: return <Banknote className="h-4 w-4" />
        }
    }

    const getAccountColorClass = (type: string) => {
        switch (type) {
            case 'bank': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            case 'credit': return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            case 'cash': return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount)
    }

    const handleAddAccount = () => {
        if (!newAccountData.name) {
            toast.error("Lütfen hesap adını girin.")
            return
        }

        const newAccount = {
            id: Date.now(),
            name: newAccountData.name,
            type: newAccountData.type,
            detail: newAccountData.detail || (newAccountData.type === 'cash' ? 'Nakit' : 'Yeni Hesap'),
            balance: parseFloat(newAccountData.balance) || 0
        }

        setAccounts([newAccount, ...accounts])
        setNewAccountData({ name: "", type: "bank", balance: "0", detail: "" })
        setIsAccountDialogOpen(false)
        toast.success(`${newAccountData.name} hesabı başarıyla eklendi.`)
    }

    const onSubmit = (data: TransactionFormValues) => {
        createTransaction(data)
        setIsDialogOpen(false)
    }

    const deleteTx = () => {
        if (txToDelete) {
            deleteTransaction(txToDelete)
            setIsDeleteDialogOpen(false)
            setTxToDelete(null)
        }
    }

    const updateTxStatus = (id: string, newStatus: TransactionStatus) => {
        updateTransaction({ id, status: newStatus })
    }

    return (
        <PageWrapper className="flex flex-col h-full gap-6">
            {/* Başlık ve Aksiyonlar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finans & Ön Muhasebe</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Kasa, banka, cari hesaplar, gelir ve gider akışınızı yönetin.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Ekstre Al
                    </Button>
                    <Button className="flex items-center gap-2 group transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20 hover:ring-offset-2" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 transition-transform group-hover:scale-125" />
                        Yeni İşlem Ekle
                    </Button>
                </div>
            </div>

            {/* Finansal Özet Kartları */}
            <div className="print:hidden">
                <FinanceStats />
            </div>

            <div className="grid gap-6 md:grid-cols-7 h-full print:block print:h-auto">
                {/* Sol Taraf: Hesap Listesi */}
                <div className="md:col-span-2 space-y-4 print:hidden">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg">Kasa ve Bankalar</CardTitle>
                                <CardDescription>Aktif hesap bakiyeleriniz</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsAccountDialogOpen(true)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            {accounts.map(acc => (
                                <div key={acc.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-md ${getAccountColorClass(acc.type)}`}>
                                            {getAccountIcon(acc.type)}
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-sm leading-tight">{acc.name}</h5>
                                            <span className="text-xs text-muted-foreground">{acc.detail}</span>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-sm">{formatCurrency(acc.balance)}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sağ Taraf: Hareketler TAB */}
                <Card className="md:col-span-5 h-[calc(100vh-14rem)] overflow-hidden border shadow-sm flex flex-col print:border-none print:shadow-none print:m-0 print:p-0 print:h-auto print:block">
                    <Tabs defaultValue="transactions" className="w-full flex-1 flex flex-col min-h-0 print:block">
                        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background rounded-t-xl shrink-0 print:hidden">
                            <TabsList>
                                <TabsTrigger value="transactions">Son Hareketler</TabsTrigger>
                                <TabsTrigger value="invoices">Faturalar</TabsTrigger>
                                <TabsTrigger value="currents">Cari Hesaplar</TabsTrigger>
                                <TabsTrigger value="payroll">Bordro Yönetimi</TabsTrigger>
                            </TabsList>

                            <div className="relative w-full sm:w-auto transition-all focus-within:ring-2 focus-within:ring-primary/20 rounded-md">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="İşlem ara..."
                                    className="pl-9 bg-muted/40 border-muted-foreground/20 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none transition-colors hover:bg-muted/60 h-9 w-full sm:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <TabsContent value="transactions" className="p-0 m-0 flex-1 min-h-0 overflow-hidden relative data-[state=active]:block">
                            {isLoading ? (
                                <div className="absolute inset-0 z-10 bg-background/50 flex p-4 justify-center backdrop-blur-[1px]">
                                    <TableSkeleton columns={6} rows={5} />
                                </div>
                            ) : (
                                <TransactionTable
                                    transactions={transactions}
                                    searchTerm={searchTerm}
                                    onUpdateStatus={updateTxStatus}
                                    onDelete={(id) => {
                                        setTxToDelete(id)
                                        setIsDeleteDialogOpen(true)
                                    }}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="invoices" className="p-4 m-0 flex-1 min-h-0 overflow-hidden data-[state=active]:flex flex-col print:p-0 print:m-0 print:block">
                            <InvoiceGenerator />
                        </TabsContent>

                        <TabsContent value="currents" className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground flex-1">
                            <Building className="h-12 w-12 mb-4 text-muted/50" />
                            <h3 className="text-lg font-medium text-foreground">Cari Hesap Bakiyeleri</h3>
                            <p className="max-w-md mt-2">Müşterilerin (Alacak) ve Tedarikçilerin (Borç) hesap dökümlerini bu ekrandan yönetebilirsiniz.</p>
                            <Button variant="outline" className="mt-6">Cari Kartları Gör</Button>
                        </TabsContent>

                        <TabsContent value="payroll" className="p-0 m-0 flex-1 min-h-0 overflow-hidden data-[state=active]:flex flex-col">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold">Bordro ve Maaş Listesi</h3>
                                        <p className="text-sm text-muted-foreground">Şubat 2026 Dönemi</p>
                                    </div>
                                    <Button variant="outline" className="gap-2">
                                        <Printer className="h-4 w-4" />
                                        Toplu Bordro Yazdır
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-muted-foreground">
                                                <th className="text-left pb-3 font-medium">Personel</th>
                                                <th className="text-left pb-3 font-medium">Brüt Maaş</th>
                                                <th className="text-left pb-3 font-medium">Net Maaş</th>
                                                <th className="text-left pb-3 font-medium">Gider Payı</th>
                                                <th className="text-left pb-3 font-medium">Durum</th>
                                                <th className="text-right pb-3 font-medium">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {[
                                                { name: "Ayşe Yılmaz", gross: 45000, net: 32500, expense: 450, status: "Ödendi" },
                                                { name: "Mehmet Demir", gross: 38000, net: 27800, expense: 1200, status: "Ödendi" },
                                                { name: "Caner Uzun", gross: 85000, net: 62000, expense: 0, status: "Beklemede" },
                                                { name: "Elif Kaya", gross: 42000, net: 30400, expense: 850, status: "Ödendi" }
                                            ].map((p, i) => (
                                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-4 font-semibold">{p.name}</td>
                                                    <td className="py-4">₺{p.gross.toLocaleString()}</td>
                                                    <td className="py-4 font-bold text-emerald-600">₺{p.net.toLocaleString()}</td>
                                                    <td className="py-4 text-rose-500">+ ₺{p.expense.toLocaleString()}</td>
                                                    <td className="py-4">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.status === 'Ödendi' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary" onClick={() => toast.success(`${p.name} için bordro PDF üretildi.`)}>
                                                            <FileText className="h-4 w-4" />
                                                            PDF
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>

            <TransactionFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={onSubmit}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Finansal İşlemi Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. İşlem kaydı tamamen silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteTx} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Yeni Hesap Ekle</DialogTitle>
                        <DialogDescription>
                            ERP sistemine yeni bir banka, kasa veya kredi kartı hesabı tanımlayın.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="acc-name">Hesap Adı</Label>
                            <Input
                                id="acc-name"
                                placeholder="Örn: Yapı Kredi Dolar Hesabı"
                                value={newAccountData.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAccountData({ ...newAccountData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Hesap Tipi</Label>
                                <Select value={newAccountData.type} onValueChange={(val) => setNewAccountData({ ...newAccountData, type: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank">Banka Hesabı</SelectItem>
                                        <SelectItem value="cash">Nakit Kasa</SelectItem>
                                        <SelectItem value="credit">Kredi Kartı / POS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="acc-balance">Açılış Bakiyesi (₺)</Label>
                                <Input
                                    id="acc-balance"
                                    type="number"
                                    placeholder="0"
                                    value={newAccountData.balance}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAccountData({ ...newAccountData, balance: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="acc-detail">Açıklama / IBAN (Opsiyonel)</Label>
                            <Input
                                id="acc-detail"
                                placeholder="Örn: TR12 0001 ..."
                                value={newAccountData.detail}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAccountData({ ...newAccountData, detail: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>İptal</Button>
                        <Button onClick={handleAddAccount}>Kaydet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    )
}
