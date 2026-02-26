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
            // Mock Data. Gerçekte: const { data } = await api.get<Customer[]>("/customers")
            // return data;

            return [
                {
                    id: "CUS-1001",
                    name: "TechCorp Bilişim A.Ş.",
                    type: "B2B",
                    contactName: "Ahmet Yılmaz",
                    email: "ahmet@techcorp.com",
                    phone: "+90 555 123 4567",
                    status: "Aktif",
                    city: "İstanbul",
                    healthScore: 85
                },
                {
                    id: "CUS-1002",
                    name: "Ayşe Demir",
                    type: "B2C",
                    contactName: "Ayşe Demir",
                    email: "ayse.demir@gmail.com",
                    phone: "+90 532 987 6543",
                    status: "Aktif",
                    city: "Ankara",
                    healthScore: 45
                }
            ] as Customer[]
        }
    })
}

// Create Customer
export function useCreateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newCustomer: CustomerFormValues) => {
            // Gerçek API: const { data } = await api.post("/customers", newCustomer)
            // return data

            // Mock
            return {
                id: `CUS-${Math.floor(Math.random() * 9000) + 1000}`,
                ...newCustomer
            } as Customer
        },
        onSuccess: (data) => {
            // Önbellekteki listeyi güncelle
            const existing = queryClient.getQueryData<Customer[]>(crmKeys.lists()) || []
            queryClient.setQueryData(crmKeys.lists(), [data, ...existing])
            toast.success("Müşteri Başarıyla Eklendi")
        },
        onError: () => {
            toast.error("Müşteri Eklenemedi", { description: "Sunucu tarafında bir hata oluştu." })
        }
    })
}

// Update Customer
export function useUpdateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: CustomerFormValues }) => {
            // Gerçek API: const { data: res } = await api.put(`/customers/${id}`, data)
            // return res

            return { id, ...data } as Customer
        },
        onSuccess: (data) => {
            queryClient.setQueryData<Customer[]>(crmKeys.lists(), (old) => {
                if (!old) return []
                return old.map(c => c.id === data.id ? data : c)
            })
            toast.success("Müşteri Başarıyla Güncellendi")
        }
    })
}

// Delete Customer
export function useDeleteCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            // Gerçek API: await api.delete(`/customers/${id}`)
            return id
        },
        onSuccess: (id) => {
            queryClient.setQueryData<Customer[]>(crmKeys.lists(), (old) => {
                if (!old) return []
                return old.filter(c => c.id !== id)
            })
            toast.success("Müşteri Başarıyla Silindi")
        }
    })
}
