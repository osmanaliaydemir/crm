import { create } from 'zustand'

export type UserRole = "admin" | "sales" | "hr" | "finance" | "support" | "employee";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
    switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    login: (userData) => set({
        user: userData,
        isAuthenticated: true
    }),

    logout: () => set({
        user: null,
        isAuthenticated: false
    }),

    switchRole: (role) => set((state) => ({
        user: state.user ? { ...state.user, role } : null
    }))
}))
