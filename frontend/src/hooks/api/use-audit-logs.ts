import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface AuditLog {
    id: string
    userId?: string
    userEmail: string
    action: string
    entityName: string
    entityId: string
    oldValues?: string
    newValues?: string
    ipAddress?: string
    userAgent?: string
    timestamp: string
}

export const auditLogKeys = {
    all: ["audit-logs"] as const,
    list: () => [...auditLogKeys.all, "list"] as const,
}

export function useAuditLogs() {
    return useQuery<AuditLog[]>({
        queryKey: auditLogKeys.list(),
        queryFn: async () => {
            const { data } = await api.get("/AuditLogs")
            return data
        }
    })
}
