import { useState, useEffect, useRef } from 'react';
import { ImageIcon, Link, X } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';

export default function ImageNode({ node }) {
    const { updateNodeLocal, updateNode } = useNodeStore();
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const containerRef = useRef(null);

    const content = {
        imageUrl: node.content?.imageUrl ?? '',
        caption: node.content?.caption ?? '',
    };

    // Auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            updateNode(node._id, { content });
        }, 500);
        return () => clearTimeout(timer);
    }, [content.imageUrl, content.caption]);

    const save = (newContent) => {
        updateNodeLocal(node._id, { content: { ...content, ...newContent } });
    };

    const loadUrl = () => {
        if (urlInput.trim()) {
            save({ imageUrl: urlInput.trim() });
            setUrlInput('');
            setShowUrlInput(false);
        }
    };

    const clearImage = () => {
        save({ imageUrl: '', caption: '' });
    };

    // Handle paste
    useEffect(() => {
        const handlePaste = (e) => {
            if (!containerRef.current?.contains(document.activeElement) &&
                !containerRef.current?.matches(':hover')) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const blob = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        save({ imageUrl: ev.target.result });
                    };
                    reader.readAsDataURL(blob);
                    return;
                }
            }

            // Check for pasted URL
            const text = e.clipboardData?.getData('text');
            if (text && /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(text)) {
                e.preventDefault();
                save({ imageUrl: text });
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);

    return (
        <div ref={containerRef} className="h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 overflow-hidden">
            {content.imageUrl ? (
                <>
                    {/* Image display */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-900">
                        <img
                            src={content.imageUrl}
                            alt={content.caption || 'Image'}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="absolute inset-0 items-center justify-center text-gray-400 text-xs" style={{ display: 'none' }}>
                            Failed to load image
                        </div>
                        <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </button>
                    </div>

                    {/* Caption */}
                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <input
                            type="text"
                            value={content.caption}
                            onChange={(e) => save({ caption: e.target.value })}
                            placeholder="Add a caption..."
                            className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none text-center"
                        />
                    </div>
                </>
            ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
                    <ImageIcon size={40} className="text-gray-300" />
                    <p className="text-xs text-gray-400">Paste an image (Ctrl+V)</p>
                    <p className="text-xs text-gray-400">or</p>

                    {showUrlInput ? (
                        <div className="flex gap-1 w-full max-w-xs">
                            <input
                                type="text"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && loadUrl()}
                                placeholder="https://example.com/image.png"
                                className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none"
                                autoFocus
                            />
                            <button onClick={loadUrl} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                                Load
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowUrlInput(true)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                            <Link size={12} />
                            Enter URL
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
