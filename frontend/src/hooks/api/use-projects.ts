import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

export const projectKeys = {
    all: ["projects"] as const,
    lists: () => [...projectKeys.all, "list"] as const,
    detail: (id: string) => [...projectKeys.all, "detail", id] as const,
}

// Get All Projects
export function useProjects() {
    return useQuery({
        queryKey: projectKeys.lists(),
        queryFn: async () => {
            const { data } = await api.get("/projects")
            return data
        }
    })
}

// Get Project By Id
export function useProject(id: string) {
    return useQuery({
        queryKey: projectKeys.detail(id),
        queryFn: async () => {
            const { data } = await api.get(`/projects/${id}`)
            return data
        },
        enabled: !!id
    })
}

// Create Project
export function useCreateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (projectData: any) => {
            const { data } = await api.post("/projects", projectData)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
            toast.success("Yeni proje başarıyla oluşturuldu.")
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || "Proje oluşturulurken hata oluştu."
            toast.error("Proje Oluşturulamadı", { description: message })
        }
    })
}

// Add Task to Project
export function useCreateTask(projectId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (taskData: any) => {
            const { data } = await api.post(`/projects/${projectId}/tasks`, taskData)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
            toast.success("Görev projeye eklendi.")
        },
        onError: (err: any) => {
            toast.error("Görev Eklenemedi")
        }
    })
}

// Update Task Status
export function useUpdateTaskStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string, status: string }) => {
            const { data } = await api.patch(`/projects/tasks/${taskId}/status`, { id: taskId, status })
            return data
        },
        onSuccess: () => {
            // Since we might not know which project id offhand without context, invalidate all project details
            queryClient.invalidateQueries({ queryKey: projectKeys.all })
            toast.success("Görev durumu güncellendi.")
        }
    })
}

// Delete Task
export function useDeleteTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (taskId: string) => {
            await api.delete(`/projects/tasks/${taskId}`)
            return taskId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all })
            toast.success("Görev silindi.")
        }
    })
}
