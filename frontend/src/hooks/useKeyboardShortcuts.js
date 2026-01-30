import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            const ctrl = e.ctrlKey || e.metaKey; // Ctrl on Windows/Linux, Cmd on Mac
            const shift = e.shiftKey;
            const alt = e.altKey;

            // Prevent shortcuts when typing in input/textarea
            if (
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.isContentEditable
            ) {
                // Allow some shortcuts even in inputs
                if (key === 'escape') {
                    e.target.blur();
                }
                return;
            }

            for (const shortcut of shortcuts) {
                const matchesKey = key === shortcut.key.toLowerCase();
                const matchesCtrl = shortcut.ctrl === ctrl;
                const matchesShift = shortcut.shift === shift;
                const matchesAlt = shortcut.alt === alt;

                if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
                    e.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}
