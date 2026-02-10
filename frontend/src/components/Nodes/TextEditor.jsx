import { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Type, Heading1, Heading2, Heading3 } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';

export default function TextEditor({ node }) {
    const { updateNodeLocal, updateNode } = useNodeStore();
    const editorRef = useRef(null);
    const initializedRef = useRef(false);

    const content = {
        html: node.content?.html ?? '<p>Start typing...</p>',
    };

    // Auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            updateNode(node._id, { content });
        }, 500);
        return () => clearTimeout(timer);
    }, [content.html]);

    // Initialize editor content
    useEffect(() => {
        if (editorRef.current && !initializedRef.current) {
            editorRef.current.innerHTML = content.html;
            initializedRef.current = true;
        }
    }, []);

    const handleInput = () => {
        if (editorRef.current) {
            updateNodeLocal(node._id, {
                content: { html: editorRef.current.innerHTML }
            });
        }
    };

    const execCmd = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const formatBlock = (tag) => {
        document.execCommand('formatBlock', false, tag);
        editorRef.current?.focus();
        handleInput();
    };

    const ToolButton = ({ onClick, active, children, title }) => (
        <button
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            className={`p-1.5 rounded transition-colors ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-1 border-b border-gray-200 dark:border-gray-700 flex items-center gap-0.5 flex-wrap bg-gray-50 dark:bg-gray-900">
                <ToolButton onClick={() => formatBlock('p')} title="Paragraph">
                    <Type size={14} />
                </ToolButton>
                <ToolButton onClick={() => formatBlock('h1')} title="Heading 1">
                    <Heading1 size={14} />
                </ToolButton>
                <ToolButton onClick={() => formatBlock('h2')} title="Heading 2">
                    <Heading2 size={14} />
                </ToolButton>
                <ToolButton onClick={() => formatBlock('h3')} title="Heading 3">
                    <Heading3 size={14} />
                </ToolButton>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-0.5" />

                <ToolButton onClick={() => execCmd('bold')} title="Bold (Ctrl+B)">
                    <Bold size={14} />
                </ToolButton>
                <ToolButton onClick={() => execCmd('italic')} title="Italic (Ctrl+I)">
                    <Italic size={14} />
                </ToolButton>
                <ToolButton onClick={() => execCmd('underline')} title="Underline (Ctrl+U)">
                    <Underline size={14} />
                </ToolButton>
                <ToolButton onClick={() => execCmd('strikeThrough')} title="Strikethrough">
                    <Strikethrough size={14} />
                </ToolButton>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-0.5" />

                <ToolButton onClick={() => execCmd('insertUnorderedList')} title="Bullet List">
                    <List size={14} />
                </ToolButton>
                <ToolButton onClick={() => execCmd('insertOrderedList')} title="Numbered List">
                    <ListOrdered size={14} />
                </ToolButton>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="flex-1 p-4 overflow-y-auto focus:outline-none prose prose-sm dark:prose-invert max-w-none"
                style={{
                    minHeight: '100px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                }}
                suppressContentEditableWarning
            />
        </div>
    );
}
