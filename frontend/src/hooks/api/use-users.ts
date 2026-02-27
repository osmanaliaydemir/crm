import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export const userKeys = {
    all: ["users"] as const,
    list: () => [...userKeys.all, "list"] as const,
}

export interface User {
    id: string
    name: string
    email: string
    role: string
    avatar?: string
    customerId?: string
}

export function useUsers() {
    return useQuery<User[]>({
        queryKey: userKeys.list(),
        queryFn: async () => {
            const { data } = await api.get("/auth/users")
            return data
        }
    })
}
