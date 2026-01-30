import { useState, useEffect, useRef } from 'react';
import { useNodeStore } from '../../store/useNodeStore';

export default function StickyNote({ node }) {
    const { updateNode, updateNodeLocal } = useNodeStore();
    const [text, setText] = useState(node.content?.text || '');
    const textareaRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        setText(node.content?.text || '');
    }, [node.content?.text]);

    const handleTextChange = (e) => {
        const newText = e.target.value;
        setText(newText);

        // Update local state immediately
        updateNodeLocal(node._id, {
            content: { ...node.content, text: newText },
        });

        // Debounced save to backend
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            updateNode(node._id, {
                content: { ...node.content, text: newText },
            });
        }, 500);
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [text]);

    const colors = {
        yellow: '#fef3c7',
        pink: '#fce7f3',
        blue: '#dbeafe',
        green: '#d1fae5',
        orange: '#fed7aa',
    };

    const currentColor = node.content?.color || 'yellow';

    return (
        <div className="h-full flex flex-col p-3" style={{ backgroundColor: colors[currentColor] }}>
            {/* Color picker */}
            <div className="flex gap-1 mb-2 no-drag">
                {Object.entries(colors).map(([name, color]) => (
                    <button
                        key={name}
                        className="w-4 h-4 rounded-full border-2 border-gray-400 hover:border-gray-600 transition-colors"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                            updateNode(node._id, {
                                content: { ...node.content, color: name },
                            });
                        }}
                        title={name}
                    />
                ))}
            </div>

            {/* Text area */}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                placeholder="Type your note..."
                className="flex-1 w-full resize-none bg-transparent border-none outline-none text-sm no-drag overflow-hidden"
                style={{
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                    color: '#000',
                    minHeight: '100px',
                }}
            />

            {/* Footer info */}
            <div className="text-xs text-gray-500 mt-2">
                {text.length} characters
            </div>
        </div>
    );
}
