import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'auto', // 'light', 'dark', 'auto'

            setTheme: (theme) => {
                set({ theme });
                applyTheme(theme);
            },

            toggleTheme: () => set((state) => {
                const newTheme = state.theme === 'light' ? 'dark' : 'light';
                applyTheme(newTheme);
                return { theme: newTheme };
            }),
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    applyTheme(state.theme);
                }
            },
        }
    )
);

function applyTheme(theme) {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(isDark ? 'dark' : 'light');
    } else {
        root.classList.add(theme);
    }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const theme = useThemeStore.getState().theme;
        if (theme === 'auto') {
            applyTheme('auto');
        }
    });
}
