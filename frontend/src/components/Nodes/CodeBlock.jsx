import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';
import Prism from 'prismjs';

// Import Prism themes and languages
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-markup'; // HTML

export default function CodeBlock({ node }) {
    const { updateNodeLocal, updateNode } = useNodeStore();
    const [copied, setCopied] = useState(false);

    // Initialize content with defaults
    const content = {
        code: node.content?.code ?? '// Write your code here...',
        language: node.content?.language ?? 'javascript'
    };

    const languages = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'c', label: 'C' },
        { value: 'cpp', label: 'C++' },
        { value: 'csharp', label: 'C#' },
        { value: 'php', label: 'PHP' },
        { value: 'ruby', label: 'Ruby' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'sql', label: 'SQL' },
        { value: 'bash', label: 'Bash' },
        { value: 'json', label: 'JSON' },
        { value: 'yaml', label: 'YAML' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'css', label: 'CSS' },
        { value: 'scss', label: 'SCSS' },
        { value: 'markup', label: 'HTML' },
    ];

    // Auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            updateNode(node._id, { content });
        }, 500);
        return () => clearTimeout(timer);
    }, [content]);

    const handleCodeChange = (e) => {
        updateNodeLocal(node._id, {
            content: { ...content, code: e.target.value }
        });
    };

    const handleLanguageChange = (e) => {
        updateNodeLocal(node._id, {
            content: { ...content, language: e.target.value }
        });
    };

    const handleKeyDown = (e) => {
        // Tab key support
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newValue = content.code.substring(0, start) + '  ' + content.code.substring(end);

            updateNodeLocal(node._id, {
                content: { ...content, code: newValue }
            });

            // Set cursor position after the inserted spaces
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 2;
            }, 0);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(content.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    // Get highlighted code
    const getHighlightedCode = () => {
        try {
            const grammar = Prism.languages[content.language];
            if (grammar) {
                return Prism.highlight(content.code, grammar, content.language);
            }
        } catch (error) {
            console.error('Prism highlighting error:', error);
        }
        return content.code;
    };

    // Generate line numbers
    const lineCount = content.code.split('\n').length;
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

    return (
        <div className="h-full flex flex-col bg-gray-900 text-gray-100">
            {/* Header */}
            <div className="p-3 border-b border-gray-700 flex items-center justify-between bg-gray-800">
                <select
                    value={content.language}
                    onChange={handleLanguageChange}
                    className="px-3 py-1.5 rounded bg-gray-700 border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                            {lang.label}
                        </option>
                    ))}
                </select>

                <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-2 transition-colors text-sm"
                >
                    {copied ? (
                        <>
                            <Check size={16} className="text-green-400" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy size={16} />
                            Copy
                        </>
                    )}
                </button>
            </div>

            {/* Code Editor */}
            <div className="flex-1 overflow-auto relative">
                <div className="flex h-full">
                    {/* Line numbers */}
                    <div className="flex-shrink-0 py-4 px-2 bg-gray-800 text-gray-500 text-right font-mono text-sm select-none border-r border-gray-700">
                        {lineNumbers.map(num => (
                            <div key={num} style={{ lineHeight: '24px' }}>
                                {num}
                            </div>
                        ))}
                    </div>

                    {/* Code area */}
                    <div className="flex-1 relative">
                        {/* Syntax highlighted overlay */}
                        <pre
                            className="absolute inset-0 p-4 font-mono text-sm pointer-events-none overflow-hidden"
                            style={{ lineHeight: '24px' }}
                        >
                            <code
                                className={`language-${content.language}`}
                                dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
                            />
                        </pre>

                        {/* Actual textarea */}
                        <textarea
                            value={content.code}
                            onChange={handleCodeChange}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            className="absolute inset-0 p-4 bg-transparent text-transparent caret-white font-mono text-sm resize-none focus:outline-none w-full h-full"
                            style={{
                                lineHeight: '24px',
                                caretColor: 'white',
                                color: 'transparent'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
