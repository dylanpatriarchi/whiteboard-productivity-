import { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';

export default function TaskList({ node }) {
    const { updateNodeLocal, updateNode } = useNodeStore();
    const [newTaskText, setNewTaskText] = useState('');

    // Initialize content if not present
    const content = node.content || {
        title: 'Task List',
        tasks: []
    };

    const tasks = content.tasks || [];

    // Debounced auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            updateNode(node._id, { content });
        }, 500);
        return () => clearTimeout(timer);
    }, [content]);

    const addTask = () => {
        if (!newTaskText.trim()) return;

        const newTask = {
            id: Date.now().toString(),
            text: newTaskText,
            completed: false
        };

        updateNodeLocal(node._id, {
            content: {
                ...content,
                tasks: [...tasks, newTask]
            }
        });

        setNewTaskText('');
    };

    const toggleTask = (taskId) => {
        updateNodeLocal(node._id, {
            content: {
                ...content,
                tasks: tasks.map(task =>
                    task.id === taskId
                        ? { ...task, completed: !task.completed }
                        : task
                )
            }
        });
    };

    const deleteTask = (taskId) => {
        updateNodeLocal(node._id, {
            content: {
                ...content,
                tasks: tasks.filter(task => task.id !== taskId)
            }
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    };

    // Calculate completion percentage
    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg">{content.title}</h3>
                {totalCount > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {completedCount}/{totalCount} tasks complete ({completionPercent}%)
                    </div>
                )}
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 group"
                    >
                        {/* Checkbox */}
                        <button
                            onClick={() => toggleTask(task.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                                }`}
                        >
                            {task.completed && <Check size={14} className="text-white" />}
                        </button>

                        {/* Task Text */}
                        <span
                            className={`flex-1 ${task.completed
                                    ? 'line-through text-gray-400 dark:text-gray-500'
                                    : ''
                                }`}
                        >
                            {task.text}
                        </span>

                        {/* Delete Button */}
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                        No tasks yet. Add one below!
                    </div>
                )}
            </div>

            {/* Add Task Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a new task..."
                        className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={addTask}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1 transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
