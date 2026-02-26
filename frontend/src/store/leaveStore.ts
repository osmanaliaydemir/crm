import { create } from 'zustand';

export type LeaveType = "Yıllık İzin" | "Mazeret İzni" | "Hastalık İzni" | "Ücretsiz İzin";
export type LeaveStatus = "waiting" | "approved" | "rejected";

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: LeaveStatus;
    appliedAt: string;
}

interface LeaveState {
    leaveRequests: LeaveRequest[];
    addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedAt'>) => void;
    updateLeaveStatus: (id: string, status: LeaveStatus) => void;
    deleteLeaveRequest: (id: string) => void;
}

const initialLeaves: LeaveRequest[] = [
    {
        id: "LR-001",
        employeeId: "EMP-001",
        employeeName: "Ayşe Yılmaz",
        type: "Yıllık İzin",
        startDate: "2026-03-10",
        endDate: "2026-03-15",
        days: 5,
        reason: "Aile ziyareti",
        status: "waiting",
        appliedAt: "2026-02-20"
    },
    {
        id: "LR-002",
        employeeId: "EMP-002",
        employeeName: "Mehmet Demir",
        type: "Hastalık İzni",
        startDate: "2026-02-15",
        endDate: "2026-02-16",
        days: 1,
        reason: "Grip/Soğuk algınlığı",
        status: "approved",
        appliedAt: "2026-02-14"
    }
];

export const useLeaveStore = create<LeaveState>((set) => ({
    leaveRequests: initialLeaves,
    addLeaveRequest: (request) => set((state) => ({
        leaveRequests: [
            {
                ...request,
                id: `LR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                status: "waiting",
                appliedAt: new Date().toISOString().split('T')[0]
            },
            ...state.leaveRequests
        ]
    })),
    updateLeaveStatus: (id, status) => set((state) => ({
        leaveRequests: state.leaveRequests.map(req =>
            req.id === id ? { ...req, status } : req
        )
    })),
    deleteLeaveRequest: (id) => set((state) => ({
        leaveRequests: state.leaveRequests.filter(req => req.id !== id)
    }))
}));
