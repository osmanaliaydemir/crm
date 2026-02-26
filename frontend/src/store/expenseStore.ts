import { create } from 'zustand';

export type ExpenseCategory = "Yemek" | "Yol / Ulaşım" | "Konaklama" | "Yazılım / Servis" | "Diğer";
export type ExpenseStatus = "waiting" | "approved" | "rejected" | "paid";

export interface Expense {
    id: string;
    employeeId: string;
    employeeName: string;
    category: ExpenseCategory;
    amount: number;
    currency: string;
    description: string;
    date: string;
    status: ExpenseStatus;
    appliedAt: string;
    receiptUrl?: string;
}

interface ExpenseState {
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id' | 'status' | 'appliedAt'>) => void;
    updateExpenseStatus: (id: string, status: ExpenseStatus) => void;
    deleteExpense: (id: string) => void;
}

const initialExpenses: Expense[] = [
    {
        id: "EXP-001",
        employeeId: "EMP-001",
        employeeName: "Ayşe Yılmaz",
        category: "Yemek",
        amount: 450,
        currency: "TRY",
        description: "Müşteri öğle yemeği",
        date: "2026-02-24",
        status: "waiting",
        appliedAt: "2026-02-25"
    },
    {
        id: "EXP-002",
        employeeId: "EMP-002",
        employeeName: "Mehmet Demir",
        category: "Yol / Ulaşım",
        amount: 1200,
        currency: "TRY",
        description: "Şehirler arası otobüs bileti",
        date: "2026-02-20",
        status: "paid",
        appliedAt: "2026-02-21"
    }
];

export const useExpenseStore = create<ExpenseState>((set) => ({
    expenses: initialExpenses,
    addExpense: (expense) => set((state) => ({
        expenses: [
            {
                ...expense,
                id: `EXP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                status: "waiting",
                appliedAt: new Date().toISOString().split('T')[0]
            },
            ...state.expenses
        ]
    })),
    updateExpenseStatus: (id, status) => set((state) => ({
        expenses: state.expenses.map(exp =>
            exp.id === id ? { ...exp, status } : exp
        )
    })),
    deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(exp => exp.id !== id)
    }))
}));
