import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

// Query Keys
export const pipelineKeys = {
    all: ["pipeline"] as const,
    boards: () => [...pipelineKeys.all, "boards"] as const,
    detail: (id: string) => [...pipelineKeys.all, "detail", id] as const,
}

export interface Deal {
    id: string;
    title: string;
    customerId: string;
    value: number;
    expectedCloseDate: string;
    probability: number;
    assignedUserId: string;
    stage: string;
    notes?: string;

    // UI İçin Eklenen Sanal Özellikler (Eğer backenden gelmiyorsa UI'da merge edilebilir)
    customerName?: string;
    assigneeName?: string;
}

export type DealFormValues = Omit<Deal, "id" | "customerName" | "assigneeName">

// Fırsatları Getir (Pipeline Panosu İçin Kolonlara Bölünmüş Halini Bekliyoruz Veya Tümü)
export function useDeals() {
    return useQuery({
        queryKey: pipelineKeys.boards(),
        queryFn: async () => {
            const { data } = await api.get<Deal[]>("/sales/deals")
            // Veya /deals. Backend'de Sales/Deals yapılış şekline göre değiştireceğiz.
            return data;
        }
    })
}

// Yeni Fırsat Ekle
export function useCreateDeal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newDeal: DealFormValues) => {
            const { data } = await api.post("/sales/deals", newDeal)
            return data as Deal
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: pipelineKeys.boards() });
            toast.success("Fırsat Başarıyla Eklendi", { description: `${data.title} panoya eklendi.` })
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || "Sunucu tarafında bir hata oluştu."
            toast.error("Fırsat Eklenemedi", { description: message })
        }
    })
}

// Fırsat Güncelle (Örn; Kolon taşıma esnasında stage güncellemesi)
export function useUpdateDeal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: Partial<Deal> }) => {
            const { data: res } = await api.put(`/sales/deals/${id}`, data)
            return res as Deal
        },
        // Optimistic UI update kullanılmıyorsa standart refetch:
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pipelineKeys.boards() });
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || "Sunucu tarafında bir hata oluştu."
            toast.error("Güncelleme Başarısız", { description: message })
        }
    })
}

// Fırsat Sil
export function useDeleteDeal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/sales/deals/${id}`)
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pipelineKeys.boards() });
            toast.success("Fırsat Silindi")
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || "Fırsat silinirken hata oluştu."
            toast.error("Silme Başarısız", { description: message })
        }
    })
}
