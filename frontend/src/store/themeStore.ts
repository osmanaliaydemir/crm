import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePrimaryColor = 'blue' | 'rose' | 'emerald' | 'violet' | 'amber' | 'neutral';

interface ThemeState {
    primaryColor: ThemePrimaryColor;
    setPrimaryColor: (color: ThemePrimaryColor) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            primaryColor: 'blue',
            setPrimaryColor: (color) => set({ primaryColor: color })
        }),
        {
            name: 'crm-theme-storage'
        }
    )
)
