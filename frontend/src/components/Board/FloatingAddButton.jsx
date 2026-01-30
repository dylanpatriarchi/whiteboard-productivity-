import { useState } from 'react';
import { Plus, StickyNote, CheckSquare, Timer, Code } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';
import { useBoardStore } from '../../store/useBoardStore';

export default function FloatingAddButton() {
    const [isOpen, setIsOpen] = useState(false);
    const { createNode } = useNodeStore();
    const { currentBoard } = useBoardStore();

    const nodeTypes = [
        {
            type: 'sticky',
            label: 'Sticky Note',
            icon: <StickyNote size={20} />,
            color: '#fef3c7',
        },
        {
            type: 'tasklist',
            label: 'Task List',
            icon: <CheckSquare size={20} />,
            color: '#dbeafe',
        },
        {
            type: 'pomodoro',
            label: 'Pomodoro Timer',
            icon: <Timer size={20} />,
            color: '#fce7f3',
        },
        {
            type: 'code',
            label: 'Code Block',
            icon: <Code size={20} />,
            color: '#d1fae5',
        },
    ];

    const handleAddNode = async (type) => {
        if (!currentBoard) {
            console.error('No current board available!');
            return;
        }

        // Random position near center
        const centerX = window.innerWidth / 2 - 150;
        const centerY = window.innerHeight / 2 - 100;
        const randomOffset = () => Math.floor(Math.random() * 100) - 50;

        const nodeConfig = {
            sticky: {
                content: { text: '', color: 'yellow' },
                size: { width: 300, height: 200 },
            },
            tasklist: {
                content: { tasks: [] },
                size: { width: 350, height: 400 },
            },
            pomodoro: {
                content: { workDuration: 25, breakDuration: 5, isRunning: false },
                size: { width: 300, height: 250 },
            },
            code: {
                content: { language: 'javascript', code: '', output: '' },
                size: { width: 500, height: 400 },
            },
        };

        const config = nodeConfig[type] || nodeConfig.sticky;

        const nodeData = {
            boardId: currentBoard._id,
            type,
            position: {
                x: centerX + randomOffset(),
                y: centerY + randomOffset(),
                zIndex: Date.now(), // Use timestamp for unique z-index
            },
            size: config.size,
            content: config.content,
            style: {},
        };

        try {
            await createNode(nodeData);
            setIsOpen(false);
        } catch (error) {
            console.error('Error creating node:', error);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* Menu items */}
            {isOpen && (
                <div className="mb-3 flex flex-col gap-2">
                    {nodeTypes.map((nodeType) => (
                        <button
                            key={nodeType.type}
                            onClick={() => handleAddNode(nodeType.type)}
                            className="flex items-center gap-3 px-4 py-3 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg transition-colors shadow-lg"
                            style={{ minWidth: '200px' }}
                        >
                            <div
                                className="w-10 h-10 rounded flex items-center justify-center"
                                style={{ backgroundColor: nodeType.color }}
                            >
                                {nodeType.icon}
                            </div>
                            <span className="font-medium">{nodeType.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Main button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full btn-primary shadow-lg flex items-center justify-center transition-transform ${isOpen ? 'rotate-45' : ''
                    }`}
                title="Add node"
            >
                <Plus size={24} />
            </button>
        </div>
    );
}
