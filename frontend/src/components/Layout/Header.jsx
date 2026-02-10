import { useState } from 'react';
import { Moon, Sun, Settings } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import SettingsModal from '../Common/SettingsModal';

export default function Header() {
    const { theme, toggleTheme } = useThemeStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <header className="h-14 border-b border-light-border dark:border-dark-border px-4 flex items-center justify-between bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">Whiteboard</h1>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="btn p-2 w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? (
                        <Moon size={18} />
                    ) : (
                        <Sun size={18} />
                    )}
                </button>

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="btn p-2 w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Settings"
                >
                    <Settings size={18} />
                </button>
            </div>

            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        </header>
    );
}
