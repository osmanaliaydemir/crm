import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface SystemUser {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string | null;
    status: "Aktif" | "Pasif";
    avatar: string | null;
    createdAt: string;
}

export interface SystemSetting {
    id: string;
    key: string;
    value: string;
    category: string;
    description: string;
}

export const useUsers = () => {
    const queryClient = useQueryClient();

    const usersQuery = useQuery<SystemUser[]>({
        queryKey: ["system-users"],
        queryFn: async () => {
            const { data } = await api.get("/api/Users");
            return data;
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await api.patch(`/api/Users/${id}/status`, status, {
                headers: { "Content-Type": "application/json" },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system-users"] });
            toast.success("Kullanıcı durumu güncellendi.");
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/api/Users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system-users"] });
            toast.success("Kullanıcı başarıyla silindi.");
        },
    });

    return {
        users: usersQuery.data ?? [],
        isLoading: usersQuery.isLoading,
        updateStatus: updateStatusMutation.mutateAsync,
        deleteUser: deleteUserMutation.mutateAsync,
    };
};

export const useSystemSettings = () => {
    const queryClient = useQueryClient();

    const settingsQuery = useQuery<SystemSetting[]>({
        queryKey: ["system-settings"],
        queryFn: async () => {
            const { data } = await api.get("/api/SystemSettings");
            return data;
        },
    });

    const saveBatchMutation = useMutation({
        mutationFn: async (settings: Partial<SystemSetting>[]) => {
            await api.post("/api/SystemSettings/save-batch", settings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system-settings"] });
            toast.success("Ayarlar kaydedildi.");
        },
    });

    return {
        settings: settingsQuery.data ?? [],
        isLoading: settingsQuery.isLoading,
        saveSettings: saveBatchMutation.mutateAsync,
    };
};
