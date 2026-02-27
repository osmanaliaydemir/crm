import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Customer, Interaction, CustomerFile } from "@/types/crm"
import { CustomerFormValues } from "@/schemas/crm"
import { toast } from "sonner"

// Query Keys
export const crmKeys = {
    all: ["customers"] as const,
    lists: () => [...crmKeys.all, "list"] as const,
    detail: (id: string) => [...crmKeys.all, "detail", id] as const,
    interactions: (customerId: string) => [...crmKeys.detail(customerId), "interactions"] as const,
    files: (customerId: string) => [...crmKeys.detail(customerId), "files"] as const,
}

// Get All Customers
export function useCustomers() {
    return useQuery({
        queryKey: crmKeys.lists(),
        queryFn: async () => {
            const { data } = await api.get<Customer[]>("/customers")
            return data;
        }
    })
}

// Create Customer
export function useCreateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newCustomer: CustomerFormValues) => {
            const { data } = await api.post("/customers", newCustomer)
            return data as Customer
        },
        onSuccess: (data) => {
            // Önbellekteki listeyi güncelle
            queryClient.invalidateQueries({ queryKey: crmKeys.lists() });
            toast.success("Müşteri Başarıyla Eklendi", { description: `${data.name} sisteme kaydedildi.` })
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || "Sunucu tarafında bir hata oluştu."
            toast.error("Müşteri Eklenemedi", { description: message })
        }
    })
}

// Update Customer
export function useUpdateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: CustomerFormValues }) => {
            const { data: res } = await api.put(`/customers/${id}`, data)
            return res as Customer
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.lists() });
            toast.success("Müşteri Başarıyla Güncellendi")
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || "Sunucu tarafında bir hata oluştu."
            toast.error("Müşteri Güncellenemedi", { description: message })
        }
    })
}

// Delete Customer
export function useDeleteCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/customers/${id}`)
            return id
        },
        onSuccess: (id) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.lists() });
            toast.success("Müşteri Başarıyla Silindi")
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || "Müşteri silinirken bir hata oluştu."
            toast.error("Silme İşlemi Başarısız", { description: message })
        }
    })
}
