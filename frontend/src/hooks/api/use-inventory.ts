import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

export const inventoryKeys = {
    all: ["inventory"] as const,
    lists: () => [...inventoryKeys.all, "list"] as const,
    detail: (id: string) => [...inventoryKeys.all, "detail", id] as const,
    stockMovements: (id: string) => [...inventoryKeys.detail(id), "movements"] as const
}

// Get All Products
export function useProducts() {
    return useQuery({
        queryKey: inventoryKeys.lists(),
        queryFn: async () => {
            const { data } = await api.get("/products")
            return data
        }
    })
}

// Get Product By Id
export function useProduct(id: string) {
    return useQuery({
        queryKey: inventoryKeys.detail(id),
        queryFn: async () => {
            const { data } = await api.get(`/products/${id}`)
            return data
        },
        enabled: !!id
    })
}

// Create Product
export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (productData: any) => {
            const { data } = await api.post("/products", productData)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
            toast.success("Yeni ürün/hizmet başarıyla oluşturuldu.")
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || "Ürün oluşturulurken hata oluştu."
            toast.error("Ürün Oluşturulamadı", { description: message })
        }
    })
}

// Update Product
export function useUpdateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const { data: result } = await api.put(`/products/${id}`, { id, ...data })
            return result
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
            queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) })
            toast.success("Ürün başarıyla güncellendi.")
        }
    })
}

// Delete Product
export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`)
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
            toast.success("Ürün silindi.")
        },
        onError: () => {
            toast.error("Ürün silinemedi. Yetkiniz olmayabilir veya silinmeye uygun değil.")
        }
    })
}
