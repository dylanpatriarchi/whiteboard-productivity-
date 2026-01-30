import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Play, X } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';
import Prism from 'prismjs';

// Import Prism themes and languages
import 'prismjs/themes/prism-tomorrow.css';
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
import 'prismjs/components/prism-markup';

export default function CodeBlock({ node }) {
    const { updateNodeLocal, updateNode } = useNodeStore();
    const [copied, setCopied] = useState(false);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [pyodideLoading, setPyodideLoading] = useState(false);
    const pyodideRef = useRef(null);

    // Initialize content with defaults
    const content = {
        code: node.content?.code ?? '// Write your code here...',
        language: node.content?.language ?? 'javascript'
    };

    const languages = [
        { value: 'javascript', label: 'JavaScript', executable: true },
        { value: 'python', label: 'Python', executable: true },
        { value: 'typescript', label: 'TypeScript', executable: false },
        { value: 'java', label: 'Java', executable: false },
        { value: 'c', label: 'C', executable: false },
        { value: 'cpp', label: 'C++', executable: false },
        { value: 'csharp', label: 'C#', executable: false },
        { value: 'php', label: 'PHP', executable: false },
        { value: 'ruby', label: 'Ruby', executable: false },
        { value: 'go', label: 'Go', executable: false },
        { value: 'rust', label: 'Rust', executable: false },
        { value: 'sql', label: 'SQL', executable: false },
        { value: 'bash', label: 'Bash', executable: false },
        { value: 'json', label: 'JSON', executable: false },
        { value: 'yaml', label: 'YAML', executable: false },
        { value: 'markdown', label: 'Markdown', executable: false },
        { value: 'css', label: 'CSS', executable: false },
        { value: 'scss', label: 'SCSS', executable: false },
        { value: 'markup', label: 'HTML', executable: false },
    ];

    const currentLanguage = languages.find(l => l.value === content.language);
    const isExecutable = currentLanguage?.executable || false;

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
        setOutput(''); // Clear output when language changes
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newValue = content.code.substring(0, start) + '  ' + content.code.substring(end);

            updateNodeLocal(node._id, {
                content: { ...content, code: newValue }
            });

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

    const loadPyodide = async () => {
        if (pyodideRef.current) return pyodideRef.current;

        setPyodideLoading(true);
        try {
            // Load Pyodide from CDN
            if (!window.loadPyodide) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            const pyodide = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
            });

            pyodideRef.current = pyodide;
            setPyodideLoading(false);
            return pyodide;
        } catch (error) {
            console.error('Pyodide load error:', error);
            setPyodideLoading(false);
            throw new Error('Failed to load Python runtime. Check your internet connection.');
        }
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput('');

        try {
            if (content.language === 'javascript') {
                // Run JavaScript
                const logs = [];
                const originalLog = console.log;
                const originalError = console.error;

                // Override console to capture output
                console.log = (...args) => {
                    logs.push(args.map(arg =>
                        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' '));
                };

                console.error = (...args) => {
                    logs.push('ERROR: ' + args.join(' '));
                };

                try {
                    // Execute code
                    const result = eval(content.code);

                    // If there's a return value, add it
                    if (result !== undefined) {
                        logs.push('→ ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
                    }

                    setOutput(logs.length > 0 ? logs.join('\n') : '(no output)');
                } catch (error) {
                    setOutput('Error: ' + error.message);
                } finally {
                    console.log = originalLog;
                    console.error = originalError;
                }
            } else if (content.language === 'python') {
                // Run Python with Pyodide
                try {
                    const pyodide = await loadPyodide();

                    // Redirect stdout and stderr
                    await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
                    `);

                    // Run user code
                    await pyodide.runPythonAsync(content.code);

                    // Get output
                    const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
                    const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');

                    let result = '';
                    if (stdout) result += stdout;
                    if (stderr) result += (result ? '\n' : '') + 'ERROR: ' + stderr;

                    setOutput(result || '(no output)');
                } catch (error) {
                    setOutput('Error: ' + error.message);
                }
            }
        } catch (error) {
            setOutput('Error: ' + error.message);
        } finally {
            setIsRunning(false);
        }
    };

    const clearOutput = () => {
        setOutput('');
    };

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
                            {lang.label} {lang.executable ? '⚡' : ''}
                        </option>
                    ))}
                </select>

                <div className="flex gap-2">
                    {isExecutable && (
                        <button
                            onClick={runCode}
                            disabled={isRunning || pyodideLoading}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded flex items-center gap-2 transition-colors text-sm"
                        >
                            <Play size={16} />
                            {isRunning ? 'Running...' : pyodideLoading ? 'Loading...' : 'Run'}
                        </button>
                    )}
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
                        <pre
                            className="absolute inset-0 p-4 font-mono text-sm pointer-events-none overflow-hidden"
                            style={{ lineHeight: '24px' }}
                        >
                            <code
                                className={`language-${content.language}`}
                                dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
                            />
                        </pre>

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

            {/* Output Panel */}
            {output && (
                <div className="border-t border-gray-700 bg-gray-800">
                    <div className="p-2 flex items-center justify-between bg-gray-900 border-b border-gray-700">
                        <span className="text-xs font-semibold text-gray-400">OUTPUT</span>
                        <button
                            onClick={clearOutput}
                            className="p-1 hover:bg-gray-700 rounded transition-colors"
                            title="Clear output"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <pre className="p-4 font-mono text-sm text-green-400 overflow-auto max-h-48 whitespace-pre-wrap">
                        {output}
                    </pre>
                </div>
            )}
        </div>
    );
}
