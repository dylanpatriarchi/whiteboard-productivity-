import { useEffect, useRef } from 'react';
import { Copy, Trash2, Lock, Unlock, ZoomIn, ZoomOut } from 'lucide-react';

export default function ContextMenu({ x, y, onClose, options }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    const handleAction = (action) => {
        action();
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className="fixed bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-xl py-1 min-w-[180px] z-[9999]"
            style={{
                left: x,
                top: y,
            }}
        >
            {options.map((option, index) => (
                <div key={index}>
                    {option.divider ? (
                        <div className="h-px bg-light-border dark:bg-dark-border my-1" />
                    ) : (
                        <button
                            onClick={() => handleAction(option.action)}
                            className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors ${option.danger ? 'text-red-600 dark:text-red-400' : ''
                                }`}
                            disabled={option.disabled}
                        >
                            {option.icon && <span className="w-4 h-4">{option.icon}</span>}
                            <span className="flex-1">{option.label}</span>
                            {option.shortcut && (
                                <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                    {option.shortcut}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
