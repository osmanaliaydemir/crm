import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export interface Notification {
    id: string;
    type: number;
    typeName: string;
    title: string;
    description: string;
    isRead: boolean;
    createdAt: string;
    actionUrl?: string;
}

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get<Notification[]>('/notifications');
            return data;
        },
        refetchInterval: 30000, // 30 saniyede bir kontrol et
    });
};

export const useUnreadNotificationCount = () => {
    return useQuery({
        queryKey: ['unreadNotificationCount'],
        queryFn: async () => {
            const { data } = await api.get<{ count: number }>('/notifications/unread-count');
            return data.count;
        },
        refetchInterval: 30000,
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
        },
    });
};

export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.patch('/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
        },
    });
};
