import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';

export default function PomodoroTimer({ node }) {
    const { updateNodeLocal, updateNode } = useNodeStore();

    // Initialize content with defaults
    const content = {
        workDuration: node.content?.workDuration ?? 25,
        breakDuration: node.content?.breakDuration ?? 5,
        soundEnabled: node.content?.soundEnabled ?? true,
        currentMode: node.content?.currentMode ?? 'work',
        timeLeft: node.content?.timeLeft ?? (25 * 60),
        isRunning: node.content?.isRunning ?? false,
        sessionsCompleted: node.content?.sessionsCompleted ?? 0
    };

    const [showSettings, setShowSettings] = useState(false);
    const [workMinutes, setWorkMinutes] = useState(content.workDuration);
    const [breakMinutes, setBreakMinutes] = useState(content.breakDuration);
    const timerRef = useRef(null);

    // Timer countdown logic
    useEffect(() => {
        if (content.isRunning && content.timeLeft > 0) {
            timerRef.current = setInterval(() => {
                const newTimeLeft = content.timeLeft - 1;

                if (newTimeLeft <= 0) {
                    // Timer finished
                    handleTimerComplete();
                } else {
                    updateNodeLocal(node._id, {
                        content: { ...content, timeLeft: newTimeLeft }
                    });
                }
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [content.isRunning, content.timeLeft]);

    // Auto-save to DB (less frequent to avoid spam)
    useEffect(() => {
        const timer = setTimeout(() => {
            updateNode(node._id, { content });
        }, 2000);
        return () => clearTimeout(timer);
    }, [content]);

    const handleTimerComplete = () => {
        // Play sound if enabled
        if (content.soundEnabled) {
            playBeep();
        }

        // Switch mode and reset timer
        if (content.currentMode === 'work') {
            // Completed a work session -> go to break
            updateNodeLocal(node._id, {
                content: {
                    ...content,
                    currentMode: 'break',
                    timeLeft: content.breakDuration * 60,
                    isRunning: false,
                    sessionsCompleted: content.sessionsCompleted + 1
                }
            });
        } else {
            // Completed break -> go back to work
            updateNodeLocal(node._id, {
                content: {
                    ...content,
                    currentMode: 'work',
                    timeLeft: content.workDuration * 60,
                    isRunning: false
                }
            });
        }
    };

    const playBeep = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // Hz
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3); // 300ms beep
        } catch (error) {
            console.error('Could not play sound:', error);
        }
    };

    const toggleTimer = () => {
        updateNodeLocal(node._id, {
            content: { ...content, isRunning: !content.isRunning }
        });
    };

    const resetTimer = () => {
        const duration = content.currentMode === 'work' ? content.workDuration : content.breakDuration;
        updateNodeLocal(node._id, {
            content: {
                ...content,
                timeLeft: duration * 60,
                isRunning: false
            }
        });
    };

    const toggleSound = () => {
        updateNodeLocal(node._id, {
            content: { ...content, soundEnabled: !content.soundEnabled }
        });
    };

    const applySettings = () => {
        const newWorkDuration = Math.max(1, Math.min(60, workMinutes));
        const newBreakDuration = Math.max(1, Math.min(60, breakMinutes));

        updateNodeLocal(node._id, {
            content: {
                ...content,
                workDuration: newWorkDuration,
                breakDuration: newBreakDuration,
                // Reset timer if settings changed
                timeLeft: content.currentMode === 'work'
                    ? newWorkDuration * 60
                    : newBreakDuration * 60,
                isRunning: false
            }
        });

        setShowSettings(false);
    };

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Calculate progress for circular progress
    const totalTime = content.currentMode === 'work'
        ? content.workDuration * 60
        : content.breakDuration * 60;
    const progress = ((totalTime - content.timeLeft) / totalTime) * 100;

    const modeColor = content.currentMode === 'work'
        ? 'text-red-500 dark:text-red-400'
        : 'text-green-500 dark:text-green-400';

    const modeBgColor = content.currentMode === 'work'
        ? 'bg-red-50 dark:bg-red-900/20'
        : 'bg-green-50 dark:bg-green-900/20';

    return (
        <div className={`h-full flex flex-col bg-white dark:bg-gray-800 ${modeBgColor} text-gray-900 dark:text-gray-100`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                    <h3 className={`font-semibold text-lg ${modeColor}`}>
                        {content.currentMode === 'work' ? '🍅 Focus Time' : '☕ Break Time'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sessions: {content.sessionsCompleted}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={toggleSound}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title={content.soundEnabled ? 'Sound On' : 'Sound Off'}
                    >
                        {content.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium block mb-1">
                                Work Duration (min)
                            </label>
                            <input
                                type="number"
                                value={workMinutes}
                                onChange={(e) => setWorkMinutes(parseInt(e.target.value) || 25)}
                                min="1"
                                max="60"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">
                                Break Duration (min)
                            </label>
                            <input
                                type="number"
                                value={breakMinutes}
                                onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 5)}
                                min="1"
                                max="60"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                            />
                        </div>
                        <button
                            onClick={applySettings}
                            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                        >
                            Apply Settings
                        </button>
                    </div>
                </div>
            )}

            {/* Timer Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                {/* Circular Progress */}
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 88}`}
                            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                            className={content.currentMode === 'work' ? 'text-red-500' : 'text-green-500'}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Time in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold font-mono">
                            {formatTime(content.timeLeft)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-center">
                <button
                    onClick={toggleTimer}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${content.isRunning
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                >
                    {content.isRunning ? (
                        <>
                            <Pause size={20} />
                            Pause
                        </>
                    ) : (
                        <>
                            <Play size={20} />
                            Start
                        </>
                    )}
                </button>
                <button
                    onClick={resetTimer}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <RotateCcw size={20} />
                    Reset
                </button>
            </div>
        </div>
    );
}
