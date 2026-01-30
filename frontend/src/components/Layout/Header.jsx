import { Moon, Sun, Settings } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

export default function Header() {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <header className="h-14 border-b border-light-border dark:border-dark-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">Whiteboard</h1>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="btn p-2 w-9 h-9 flex items-center justify-center"
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? (
                        <Moon size={18} />
                    ) : (
                        <Sun size={18} />
                    )}
                </button>

                <button
                    className="btn p-2 w-9 h-9 flex items-center justify-center"
                    title="Settings"
                >
                    <Settings size={18} />
                </button>
            </div>
        </header>
    );
}
