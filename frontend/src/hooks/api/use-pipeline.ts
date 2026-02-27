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
    description?: string;
    customerId: string;
    customerName?: string;
    value: number;
    probability: number;
    assignedToId?: string;
    assignedToName?: string;
    expectedCloseDate: string;
    stage: string;
    stageName?: string;
    sortOrder: number;
    createdAt?: string;
}

export type DealFormValues = Omit<Deal, "id" | "customerName" | "assignedToName" | "stageName" | "createdAt" | "sortOrder">

// Fırsatları Getir
export function useDeals() {
    return useQuery({
        queryKey: pipelineKeys.boards(),
        queryFn: async () => {
            const { data } = await api.get<Deal[]>("/pipeline")
            return data;
        }
    })
}

// Yeni Fırsat Ekle
export function useCreateDeal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newDeal: DealFormValues) => {
            const { data } = await api.post("/pipeline", newDeal)
            return data as Deal
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: pipelineKeys.boards() });
            toast.success("Fırsat Başarıyla Eklendi", { description: `${data.title} panoya eklendi.` })
        }
    })
}

// Fırsat Güncelle (Genel Düzenleme)
export function useUpdateDeal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: Partial<Deal> }) => {
            const { data: res } = await api.put(`/pipeline/${id}`, data)
            return res as Deal
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pipelineKeys.boards() });
            toast.success("Fırsat Güncellendi");
        }
    })
}

// Aşama Güncelle (Drag & Drop için PATCH)
export function useUpdateDealStage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, stage, sortOrder = 0 }: { id: string, stage: string, sortOrder?: number }) => {
            // Backend UpdatePipelineDealStageDto bekliyor: { Id, NewStage, NewSortOrder }
            await api.patch(`/pipeline/${id}/stage`, {
                id,
                newStage: stage,
                newSortOrder: sortOrder
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pipelineKeys.boards() });
        },
        onError: (err: any) => {
            toast.error("Aşama güncellenemedi.");
        }
    })
}

// Fırsat Sil
export function useDeleteDeal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/pipeline/${id}`)
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pipelineKeys.boards() });
            toast.success("Fırsat Silindi")
        }
    })
}


