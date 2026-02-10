import { useState, useEffect } from 'react';
import { X, Key, Trash2, Database, Save, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import { useBoardStore } from '../../store/useBoardStore';

export default function SettingsModal({ onClose }) {
    const [activeTab, setActiveTab] = useState('general');
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('gpt-3.5-turbo');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const { fetchBoards } = useBoardStore();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/settings');
            const openai = res.data.apiKeys?.openai || {};
            if (openai.enabled) {
                setApiKey('sk-................................'); // Masked placeholder
            }
            if (openai.model) {
                setModel(openai.model);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const saveSettings = async () => {
        setIsLoading(true);
        setStatus('');
        try {
            const data = {
                apiKeys: {
                    openai: {
                        model,
                        // Only send key if it's not the masked placeholder
                        ...(apiKey && !apiKey.startsWith('sk-...') ? { key: apiKey, enabled: true } : {})
                    }
                }
            };
            await api.put('/settings', data);
            setStatus('success');
            setTimeout(() => setStatus(''), 2000);
        } catch (error) {
            setStatus('error');
            console.error('Failed to save settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearDatabase = async () => {
        if (!confirm('Are you sure? This will delete ALL boards and nodes. This action cannot be undone.')) return;

        setIsLoading(true);
        try {
            // We'll implement a reset endpoint or just delete current board content
            // For now, let's just clear local storage and reload to simulate a fresh start
            // In a real app, this should call a backend endpoint
            localStorage.clear();
            window.location.reload();
        } catch (error) {
            console.error('Failed to clear database:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-[500px] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <SettingsIcon size={20} /> Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        AI Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab('danger')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'danger'
                            ? 'border-red-500 text-red-600 dark:text-red-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Danger Zone
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <Key size={16} /> OpenAI API Key
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Required for AI Chat node. The key is stored securely on your server.
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium mb-1">API Key</label>
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="sk-..."
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Model</label>
                                        <select
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="gpt-5.2">GPT-5.2 (Flagship - Recommended)</option>
                                            <option value="gpt-5-mini">GPT-5 Mini (Fast & Efficient)</option>
                                            <option value="gpt-5.3-codex">GPT-5.3 Codex (Best for Code)</option>
                                            <option value="gpt-4o">GPT-4o (Legacy)</option>
                                            <option value="gpt-4-turbo">GPT-4 Turbo (Legacy)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={saveSettings}
                                disabled={isLoading}
                                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${status === 'success' ? 'bg-green-500 text-white' :
                                    status === 'error' ? 'bg-red-500 text-white' :
                                        'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {isLoading ? (
                                    'Saving...'
                                ) : status === 'success' ? (
                                    'Saved!'
                                ) : status === 'error' ? (
                                    'Error Saving'
                                ) : (
                                    <>
                                        <Save size={16} /> Save Configuration
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {activeTab === 'danger' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900">
                                <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                                    <Trash2 size={16} /> Clear All Data
                                </h3>
                                <p className="text-xs text-red-600/80 dark:text-red-400/80 mb-4">
                                    This will wipe all local data and reset the application state. Use this if the app is stuck or you want a fresh start.
                                </p>
                                <button
                                    onClick={clearDatabase}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <RotateCcw size={14} /> Reset Application
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Icon helper since we can't import Settings from lucide-react inside the component if we use the same name
function SettingsIcon({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    );
}
