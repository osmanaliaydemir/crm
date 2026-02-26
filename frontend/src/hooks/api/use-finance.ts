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
            // Mock Data. 
            return [
                {
                    id: "TRX-101",
                    date: "26 Eki 2023",
                    description: "TechCorp A.Ş. Fatura Ödemesi",
                    type: "in",
                    category: "Tahsilat",
                    amount: 150000,
                    status: "Tamamlandı"
                },
                {
                    id: "TRX-102",
                    date: "25 Eki 2023",
                    description: "Ekim Ayı Personel Maaşları",
                    type: "out",
                    category: "Gider",
                    amount: 125000,
                    status: "Tamamlandı"
                },
            ] as Transaction[]
        }
    })
}

// Create Transaction
export function useCreateTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newTx: TransactionFormValues) => {
            return {
                id: `TRX-${Math.floor(Math.random() * 900) + 100}`,
                date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
                ...newTx,
                status: newTx.status as TransactionStatus
            } as Transaction
        },
        onSuccess: (data) => {
            const existing = queryClient.getQueryData<Transaction[]>(financeKeys.lists()) || []
            queryClient.setQueryData(financeKeys.lists(), [data, ...existing])
            toast.success("İşlem Başarıyla Eklendi")
        }
    })
}

// Update Transaction Status
export function useUpdateTransactionStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, status }: { id: string, status: TransactionStatus }) => {
            return { id, status }
        },
        onSuccess: (data) => {
            queryClient.setQueryData<Transaction[]>(financeKeys.lists(), (old) => {
                if (!old) return []
                return old.map(t => t.id === data.id ? { ...t, status: data.status } : t)
            })
            toast.success("İşlem Durumu Güncellendi")
        }
    })
}

// Delete Transaction
export function useDeleteTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            return id
        },
        onSuccess: (id) => {
            queryClient.setQueryData<Transaction[]>(financeKeys.lists(), (old) => {
                if (!old) return []
                return old.filter(t => t.id !== id)
            })
            toast.success("İşlem Silindi")
        }
    })
}
