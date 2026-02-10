import { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, Play, X, Loader } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';
import Prism from 'prismjs';

// Import Prism themes and languages
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';

// Shared Pyodide instance across all CodeBlock components
let sharedPyodide = null;
let pyodideLoadingPromise = null;

async function getOrLoadPyodide(setStatus) {
    // Already loaded
    if (sharedPyodide) return sharedPyodide;

    // Loading in progress by another component
    if (pyodideLoadingPromise) {
        setStatus('Loading Python (shared)...');
        return pyodideLoadingPromise;
    }

    // Start fresh load
    pyodideLoadingPromise = (async () => {
        try {
            setStatus('Loading Pyodide script...');

            // Load CDN script if not already loaded
            if (!window.loadPyodide) {
                await new Promise((resolve, reject) => {
                    // Check if script already exists
                    if (document.querySelector('script[src*="pyodide"]')) {
                        // Wait for it to load
                        const check = setInterval(() => {
                            if (window.loadPyodide) {
                                clearInterval(check);
                                resolve();
                            }
                        }, 100);
                        setTimeout(() => { clearInterval(check); reject(new Error('Timeout')); }, 30000);
                        return;
                    }

                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
                    script.crossOrigin = 'anonymous';
                    script.onload = () => {
                        // Wait for loadPyodide to be globally available
                        const check = setInterval(() => {
                            if (window.loadPyodide) {
                                clearInterval(check);
                                resolve();
                            }
                        }, 50);
                        setTimeout(() => { clearInterval(check); reject(new Error('Timeout')); }, 15000);
                    };
                    script.onerror = () => reject(new Error('Failed to load Pyodide script from CDN'));
                    document.head.appendChild(script);
                });
            }

            setStatus('Initializing Python runtime...');

            const pyodide = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
            });

            sharedPyodide = pyodide;
            return pyodide;
        } catch (error) {
            pyodideLoadingPromise = null; // Allow retry
            throw error;
        }
    })();

    return pyodideLoadingPromise;
}

export default function CodeBlock({ node }) {
    const { updateNodeLocal, updateNode } = useNodeStore();
    const [copied, setCopied] = useState(false);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [loadStatus, setLoadStatus] = useState('');

    // Initialize content with defaults
    const content = {
        code: node.content?.code ?? '// Write your code here...',
        language: node.content?.language ?? 'javascript'
    };

    const languages = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
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
        const newLang = e.target.value;
        const defaultCode = newLang === 'python'
            ? '# Write your Python code here...\nprint("Hello World!")'
            : '// Write your JavaScript code here...\nconsole.log("Hello World!");';

        updateNodeLocal(node._id, {
            content: { ...content, language: newLang, code: content.code === '// Write your code here...' || content.code === '# Write your Python code here...\nprint("Hello World!")' || content.code === '// Write your JavaScript code here...\nconsole.log("Hello World!");' ? defaultCode : content.code }
        });
        setOutput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const spaces = content.language === 'python' ? '    ' : '  ';
            const newValue = content.code.substring(0, start) + spaces + content.code.substring(end);

            updateNodeLocal(node._id, {
                content: { ...content, code: newValue }
            });

            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + spaces.length;
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

    const runJavaScript = () => {
        const logs = [];
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalInfo = console.info;

        console.log = (...args) => {
            logs.push(args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
        };
        console.warn = (...args) => logs.push('⚠ ' + args.map(String).join(' '));
        console.error = (...args) => logs.push('❌ ' + args.map(String).join(' '));
        console.info = (...args) => logs.push('ℹ ' + args.map(String).join(' '));

        try {
            // Wrap in function to allow return
            const wrappedCode = `(function() { ${content.code} })()`;
            const result = eval(wrappedCode);

            if (result !== undefined) {
                logs.push('→ ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
            }

            return logs.length > 0 ? logs.join('\n') : '(no output)';
        } catch (error) {
            return (logs.length > 0 ? logs.join('\n') + '\n' : '') + '❌ ' + error.name + ': ' + error.message;
        } finally {
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
            console.info = originalInfo;
        }
    };

    const runPython = async () => {
        try {
            const pyodide = await getOrLoadPyodide(setLoadStatus);
            setLoadStatus('');

            // Reset stdout/stderr before each run
            pyodide.runPython(`
import sys
from io import StringIO
_stdout_capture = StringIO()
_stderr_capture = StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);

            // Run user code
            try {
                pyodide.runPython(content.code);
            } catch (pyErr) {
                // Get any partial output before error
                const partialOut = pyodide.runPython('_stdout_capture.getvalue()');
                const errMsg = pyErr.message || String(pyErr);

                // Clean up Python traceback to show just the relevant error
                const cleanError = errMsg.replace(/PythonError: Traceback \(most recent call last\):\n/, '')
                    .replace(/  File "<exec>", line \d+, in <module>\n/, '');

                return (partialOut ? partialOut + '\n' : '') + '❌ ' + cleanError;
            }

            // Get captured output
            const stdout = pyodide.runPython('_stdout_capture.getvalue()');
            const stderr = pyodide.runPython('_stderr_capture.getvalue()');

            let result = '';
            if (stdout) result += stdout;
            if (stderr) result += (result ? '\n' : '') + '⚠ ' + stderr;

            return result || '(no output)';
        } catch (error) {
            setLoadStatus('');
            if (error.message?.includes('Failed to load') || error.message?.includes('Timeout')) {
                return '❌ Failed to load Python runtime.\nMake sure you have an internet connection.\nPyodide needs to download ~20MB on first use.';
            }
            return '❌ ' + error.message;
        }
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput('');

        try {
            let result;
            if (content.language === 'javascript') {
                result = runJavaScript();
            } else if (content.language === 'python') {
                result = await runPython();
            }
            setOutput(result);
        } catch (error) {
            setOutput('❌ ' + error.message);
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
                <div className="flex items-center gap-2">
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
                    {loadStatus && (
                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                            <Loader size={12} className="animate-spin" />
                            {loadStatus}
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded flex items-center gap-2 transition-colors text-sm font-medium"
                    >
                        {isRunning ? (
                            <>
                                <Loader size={16} className="animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play size={16} />
                                Run
                            </>
                        )}
                    </button>
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
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Output</span>
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
