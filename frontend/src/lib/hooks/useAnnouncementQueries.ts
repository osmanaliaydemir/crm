import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: string;
    typeName: string;
    isActive: boolean;
    createdAt: string;
    publishedById: string;
    publishedByNames: string;
}

export const useActiveAnnouncements = () => {
    return useQuery({
        queryKey: ['activeAnnouncements'],
        queryFn: async () => {
            const { data } = await api.get<Announcement[]>('/announcements/active');
            return data;
        },
        staleTime: 10 * 60 * 1000,
    });
};

export const useAllAnnouncements = () => {
    return useQuery({
        queryKey: ['allAnnouncements'],
        queryFn: async () => {
            const { data } = await api.get<Announcement[]>('/announcements');
            return data;
        },
    });
};

export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            await api.post('/announcements', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeAnnouncements'] });
            queryClient.invalidateQueries({ queryKey: ['allAnnouncements'] });
        },
    });
};

export const useDeleteAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/announcements/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeAnnouncements'] });
            queryClient.invalidateQueries({ queryKey: ['allAnnouncements'] });
        },
    });
};

export const useToggleAnnouncementStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/announcements/${id}/toggle`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeAnnouncements'] });
            queryClient.invalidateQueries({ queryKey: ['allAnnouncements'] });
        },
    });
};

