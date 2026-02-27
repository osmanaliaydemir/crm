import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Transaction, TransactionStatus, BankAccount } from "@/types/finance"
import { TransactionFormValues } from "@/schemas/finance"
import { toast } from "sonner"

export const financeKeys = {
    all: ["finance"] as const,
    transactions: () => [...financeKeys.all, "transactions"] as const,
    accounts: () => [...financeKeys.all, "accounts"] as const,
    detail: (id: string) => [...financeKeys.all, "detail", id] as const,
}

// Get All Transactions
export function useTransactions() {
    return useQuery({
        queryKey: financeKeys.transactions(),
        queryFn: async () => {
            const { data } = await api.get<Transaction[]>("/transactions")
            return data
        }
    })
}

// Get All Bank Accounts
export function useBankAccounts() {
    return useQuery({
        queryKey: financeKeys.accounts(),
        queryFn: async () => {
            const { data } = await api.get<BankAccount[]>("/bankaccounts")
            return data
        }
    })
}

// Create Bank Account
export function useCreateBankAccount() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newAccount: { name: string, type: string, detail: string, initialBalance: number }) => {
            const { data } = await api.post("/bankaccounts", newAccount)
            return data as BankAccount
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: financeKeys.accounts() })
            toast.success("Hesap Başarıyla Eklendi")
        }
    })
}

// Create Transaction
export function useCreateTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newTx: TransactionFormValues) => {
            const payload = {
                date: new Date().toISOString(),
                description: newTx.description,
                type: newTx.type,
                category: newTx.category,
                amount: newTx.amount,
                status: newTx.status,
                accountId: newTx.accountId
            };
            const { data } = await api.post("/transactions", payload)
            return data as Transaction
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: financeKeys.transactions() })
            queryClient.invalidateQueries({ queryKey: financeKeys.accounts() })
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
            queryClient.invalidateQueries({ queryKey: financeKeys.transactions() })
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
            queryClient.invalidateQueries({ queryKey: financeKeys.transactions() })
            queryClient.invalidateQueries({ queryKey: financeKeys.accounts() })
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

