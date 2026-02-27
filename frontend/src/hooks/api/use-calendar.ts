import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

export const calendarKeys = {
    all: ["calendar"] as const,
    events: (filters?: { start?: string, end?: string }) => [...calendarKeys.all, "events", filters] as const,
    eventDetail: (id: string) => [...calendarKeys.all, "eventDetail", id] as const,
}

// === EVENTS (Takvim Etkinlikleri) ===

export function useEvents(filters?: { start?: string, end?: string }) {
    return useQuery({
        queryKey: calendarKeys.events(filters),
        queryFn: async () => {
            const params = new URLSearchParams()
            if (filters?.start) params.append("start", filters.start)
            if (filters?.end) params.append("end", filters.end)

            const { data } = await api.get(`/events?${params.toString()}`)
            return data
        }
    })
}

export function useEventDetail(id: string) {
    return useQuery({
        queryKey: calendarKeys.eventDetail(id),
        queryFn: async () => {
            const { data } = await api.get(`/events/${id}`)
            return data
        },
        enabled: !!id
    })
}

export function useCreateEvent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (eventData: any) => {
            const { data } = await api.post("/events", eventData)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all })
            toast.success("Etkinlik başarıyla oluşturuldu.")
        },
        onError: (err: any) => {
            toast.error("Etkinlik Oluşturulamadı", { description: err?.response?.data?.message || err?.message })
        }
    })
}

export function useUpdateEvent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (eventData: { id: string } & any) => {
            const { data } = await api.put(`/events/${eventData.id}`, eventData)
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all })
            toast.success("Etkinlik güncellendi.")
        }
    })
}

export function useDeleteEvent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/events/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all })
            toast.success("Etkinlik silindi.")
        }
    })
}

// === ATTENDEES (Katılımcı Yönetimi) ===

export function useAddAttendee() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ eventId, userId }: { eventId: string, userId: string }) => {
            const { data } = await api.post(`/events/${eventId}/attendees`, { eventId, userId })
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.eventDetail(variables.eventId) })
            toast.success("Katılımcı eklendi.")
        },
        onError: (err: any) => {
            toast.error("Katılımcı Eklenemedi", { description: err?.response?.data || "Bilinmeyen bir hata oluştu." })
        }
    })
}

export function useUpdateAttendeeStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ attendeeId, status }: { attendeeId: string, status: string }) => {
            const { data } = await api.patch(`/events/attendees/${attendeeId}/status`, { id: attendeeId, status })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all })
            toast.success("Katılım durumu güncellendi.")
        }
    })
}

export function useRemoveAttendee() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (attendeeId: string) => {
            await api.delete(`/events/attendees/${attendeeId}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all })
            toast.success("Katılımcı çıkarıldı.")
        }
    })
}
