import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Settings, Loader } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';
import api from '../../services/api';

export default function AIChatNode({ node }) {
    const { updateNodeLocal, updateNode } = useNodeStore();
    const messagesEndRef = useRef(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const content = {
        messages: node.content?.messages ?? [],
        systemPrompt: node.content?.systemPrompt ?? 'You are a helpful assistant. Be concise.',
    };

    // Auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            updateNode(node._id, { content });
        }, 500);
        return () => clearTimeout(timer);
    }, [JSON.stringify(content)]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [content.messages]);

    const save = (newContent) => {
        updateNodeLocal(node._id, { content: { ...content, ...newContent } });
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input.trim() };
        const newMessages = [...content.messages, userMessage];
        save({ messages: newMessages });
        setInput('');
        setIsLoading(true);
        setError('');

        try {
            const apiMessages = [
                { role: 'system', content: content.systemPrompt },
                ...newMessages,
            ];

            const response = await api.post('/ai/chat', { messages: apiMessages });
            const assistantMessage = { role: 'assistant', content: response.data.message };
            save({ messages: [...newMessages, assistantMessage] });
        } catch (err) {
            const errMsg = err.response?.data?.error || err.message || 'Failed to send message';
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        save({ messages: [] });
        setError('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            {/* Header */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                <span className="text-sm font-semibold flex items-center gap-1">🤖 AI Chat</span>
                <div className="flex gap-1">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Settings"
                    >
                        <Settings size={14} />
                    </button>
                    <button
                        onClick={clearHistory}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors text-red-500"
                        title="Clear chat"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* System prompt settings */}
            {showSettings && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-900">
                    <label className="text-xs font-medium text-gray-500 block mb-1">System Prompt</label>
                    <textarea
                        value={content.systemPrompt}
                        onChange={(e) => save({ systemPrompt: e.target.value })}
                        className="w-full text-xs p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 resize-none focus:outline-none"
                        rows={3}
                        placeholder="You are a helpful assistant..."
                    />
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {content.messages.length === 0 && (
                    <div className="text-center text-gray-400 text-xs mt-8">
                        <p className="text-2xl mb-2">🤖</p>
                        <p>Ask me anything!</p>
                        <p className="text-[10px] mt-1">Make sure OpenAI API key is set in Settings</p>
                    </div>
                )}

                {content.messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed whitespace-pre-wrap
                                ${msg.role === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-sm'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg rounded-bl-sm flex items-center gap-2">
                            <Loader size={12} className="animate-spin" />
                            <span className="text-xs text-gray-500">Thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
                <div className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
                    {error}
                </div>
            )}

            {/* Input */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={1}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
