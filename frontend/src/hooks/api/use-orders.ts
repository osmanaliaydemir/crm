import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

export const orderKeys = {
    all: ["orders"] as const,
    lists: () => [...orderKeys.all, "list"] as const,
    detail: (id: string) => [...orderKeys.all, "detail", id] as const,
}

// Get All Orders
export function useOrders() {
    return useQuery({
        queryKey: orderKeys.lists(),
        queryFn: async () => {
            const { data } = await api.get("/orders")
            return data
        }
    })
}

// Get Order By Id
export function useOrder(id: string) {
    return useQuery({
        queryKey: orderKeys.detail(id),
        queryFn: async () => {
            const { data } = await api.get(`/orders/${id}`)
            return data
        },
        enabled: !!id
    })
}

// Create Order
export function useCreateOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (orderData: any) => {
            const { data } = await api.post("/orders", orderData)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
            toast.success("Yeni sipariş başarıyla oluşturuldu.")
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || err?.response?.data?.error || "Sipariş oluşturulurken hata oluştu."
            toast.error("Sipariş Oluşturulamadı", { description: message })
        }
    })
}

// Update Order Status
export function useUpdateOrderStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const { data } = await api.patch(`/orders/${id}/status`, { id, status })
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
            toast.success("Sipariş durumu güncellendi.")
        }
    })
}
