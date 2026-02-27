import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export interface DashboardSummary {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalCustomers: number;
    activeOrders: number;
    activeProjects: number;
    openTickets: number;
    pendingLeaveRequests: number;
}

export interface MonthlyFinancial {
    month: string;
    income: number;
    expense: number;
    profit: number;
}

export interface SalesPerformance {
    employeeName: string;
    totalOrders: number;
    totalSalesAmount: number;
}

export interface ProjectStatus {
    status: string;
    count: number;
}

// 1. Genel Pano Özeti (Dashboard Summary)
export const useDashboardSummary = () => {
    return useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: async () => {
            const { data } = await api.get<DashboardSummary>('/reports/dashboard-summary');
            return data;
        },
        staleTime: 5 * 60 * 1000 // 5 dakika cache (Hemen güncellenme zorunlu degil)
    });
};

// 2. Yıllık/Aylık Finans Grafiği (Bar/Line Chart için)
export const useMonthlyFinancial = (year: number) => {
    return useQuery({
        queryKey: ['monthlyFinancial', year],
        queryFn: async () => {
            const { data } = await api.get<MonthlyFinancial[]>(`/reports/monthly-financial?year=${year}`);
            return data;
        },
        staleTime: 5 * 60 * 1000
    });
};

// 3. Satış Performansı (Çubuk veya Liste)
export const useSalesPerformance = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['salesPerformance', startDate, endDate],
        queryFn: async () => {
            let url = '/reports/sales-performance';
            if (startDate || endDate) {
                url += '?';
                if (startDate) url += `startDate=${startDate}&`;
                if (endDate) url += `endDate=${endDate}`;
            }
            const { data } = await api.get<SalesPerformance[]>(url);
            return data;
        },
    });
};

// 4. Proje Durum Dağılımı (Pie Chart)
export const useProjectDistribution = () => {
    return useQuery({
        queryKey: ['projectDistribution'],
        queryFn: async () => {
            const { data } = await api.get<ProjectStatus[]>('/reports/project-status-distribution');
            return data;
        },
    });
};
