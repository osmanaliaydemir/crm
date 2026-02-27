import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

export const hrKeys = {
    all: ["hr"] as const,
    expenses: () => [...hrKeys.all, "expenses"] as const,
    myExpenses: () => [...hrKeys.all, "my-expenses"] as const,
    leaves: () => [...hrKeys.all, "leaves"] as const,
    myLeaves: () => [...hrKeys.all, "my-leaves"] as const,
}

// === EXPENSES ===

export function useExpenses() {
    return useQuery({
        queryKey: hrKeys.expenses(),
        queryFn: async () => {
            const { data } = await api.get("/expenses")
            return data
        }
    })
}

export function useMyExpenses() {
    return useQuery({
        queryKey: hrKeys.myExpenses(),
        queryFn: async () => {
            const { data } = await api.get("/expenses/my-expenses")
            return data
        }
    })
}

export function useCreateExpense() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (expenseData: any) => {
            const { data } = await api.post("/expenses", expenseData)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.expenses() })
            queryClient.invalidateQueries({ queryKey: hrKeys.myExpenses() })
            toast.success("Masraf talebi başarıyla oluşturuldu.")
        },
        onError: (err: any) => {
            toast.error("Masraf Oluşturulamadı", { description: err?.response?.data?.message || err?.message })
        }
    })
}

export function useUpdateExpenseStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const { data } = await api.patch(`/expenses/${id}/status`, { id, status })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.expenses() })
            queryClient.invalidateQueries({ queryKey: hrKeys.myExpenses() })
            toast.success("Masraf durumu güncellendi.")
        }
    })
}


// === LEAVE REQUESTS ===

export function useLeaves() {
    return useQuery({
        queryKey: hrKeys.leaves(),
        queryFn: async () => {
            const { data } = await api.get("/leaverequests")
            return data
        }
    })
}

export function useMyLeaves() {
    return useQuery({
        queryKey: hrKeys.myLeaves(),
        queryFn: async () => {
            const { data } = await api.get("/leaverequests/my-requests")
            return data
        }
    })
}

export function useCreateLeave() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (leaveData: any) => {
            const { data } = await api.post("/leaverequests", leaveData)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.leaves() })
            queryClient.invalidateQueries({ queryKey: hrKeys.myLeaves() })
            toast.success("İzin talebi başarıyla oluşturuldu.")
        },
        onError: (err: any) => {
            toast.error("İzin Talebi Oluşturulamadı", { description: err?.response?.data?.message || err?.message })
        }
    })
}

export function useUpdateLeaveStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const { data } = await api.patch(`/leaverequests/${id}/status`, { id, status })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.leaves() })
            queryClient.invalidateQueries({ queryKey: hrKeys.myLeaves() })
            toast.success("İzin durumu güncellendi.")
        }
    })
}
