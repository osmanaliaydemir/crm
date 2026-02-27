import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { PortalSummary, PortalOrder, PortalInvoice } from "@/types/portal"

export const portalKeys = {
    all: ["portal"] as const,
    summary: () => [...portalKeys.all, "summary"] as const,
    orders: () => [...portalKeys.all, "orders"] as const,
    invoices: () => [...portalKeys.all, "invoices"] as const,
}

// Get Portal Summary (Total orders, pending payments, etc.)
export function usePortalSummary() {
    return useQuery({
        queryKey: portalKeys.summary(),
        queryFn: async () => {
            const { data } = await api.get("/Portal/summary")
            return data as PortalSummary
        }
    })
}

// Get Customer's Orders
export function usePortalOrders() {
    return useQuery({
        queryKey: portalKeys.orders(),
        queryFn: async () => {
            const { data } = await api.get("/Portal/orders")
            return data as PortalOrder[]
        }
    })
}

// Get Customer's Invoices
export function usePortalInvoices() {
    return useQuery({
        queryKey: portalKeys.invoices(),
        queryFn: async () => {
            const { data } = await api.get("/Portal/invoices")
            return data as PortalInvoice[]
        }
    })
}
