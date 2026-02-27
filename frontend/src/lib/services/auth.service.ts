import { api } from "@/lib/api";
import { User } from "@/store/authStore";

export interface AuthResponse {
    token: string;
    refreshToken: string;
    user: User; // Backend'in döndüğü User objesine göre şekillenir
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    department?: string;
}

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/login", data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<void> => {
        await api.post("/auth/register", data);
    },

    me: async (): Promise<User> => {
        const response = await api.get<User>("/auth/me");
        return response.data;
    },

    logout: async (): Promise<void> => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        }
    }
};
