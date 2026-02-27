import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Transaction, TransactionStatus } from "@/types/finance"
import { TransactionFormValues } from "@/schemas/finance"
import { toast } from "sonner"

export const financeKeys = {
    all: ["transactions"] as const,
    lists: () => [...financeKeys.all, "list"] as const,
    detail: (id: string) => [...financeKeys.all, "detail", id] as const,
}

// Get All Transactions
export function useTransactions() {
    return useQuery({
        queryKey: financeKeys.lists(),
        queryFn: async () => {
            const { data } = await api.get<Transaction[]>("/transactions")
            return data
        }
    })
}

// Create Transaction
export function useCreateTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newTx: TransactionFormValues) => {
            // Frontend'deki Form değerlerini Backend DTO'ya uyarlıyoruz
            const payload = {
                date: new Date().toISOString(),
                description: newTx.description,
                type: newTx.type,
                category: newTx.category,
                amount: newTx.amount,
                status: newTx.status
            };
            const { data } = await api.post("/transactions", payload)
            return data as Transaction
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: financeKeys.lists() })
            toast.success("İşlem Başarıyla Eklendi")
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || "İşlem eklenirken hata oluştu."
            toast.error("İşlem Eklenemedi", { description: message })
        }
    })
}

// Update Transaction Status
export function useUpdateTransactionStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, status }: { id: string, status: TransactionStatus }) => {
            const { data } = await api.patch(`/transactions/${id}/status`, { id, status })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: financeKeys.lists() })
            toast.success("İşlem Durumu Güncellendi")
        }
    })
}

// Delete Transaction
export function useDeleteTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/transactions/${id}`)
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: financeKeys.lists() })
            toast.success("İşlem Silindi")
        },
        onError: () => {
            toast.error("Silme Başarısız. Yönetici Yetkisi Gerekebilir.")
        }
    })
}

// Fatura Oluşturma Hook'u
export function useCreateInvoice() {
    return useMutation({
        mutationFn: async (invoiceData: any) => {
            const { data } = await api.post("/invoices", invoiceData)
            return data
        },
        onSuccess: () => {
            toast.success("Fatura başarıyla oluşturuldu ve kaydedildi.")
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || "Fatura oluşturulamadı."
            toast.error("Kayıt Başarısız", { description: message })
        }
    })
}
