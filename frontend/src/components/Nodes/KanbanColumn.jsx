import { useState, useEffect } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';

const DEFAULT_COLUMNS = [
    { id: 'todo', title: 'To Do', color: '#ef4444', cards: [] },
    { id: 'progress', title: 'In Progress', color: '#f59e0b', cards: [] },
    { id: 'done', title: 'Done', color: '#10b981', cards: [] },
];

export default function KanbanColumn({ node }) {
    const { updateNodeLocal, updateNode } = useNodeStore();
    const [newCardText, setNewCardText] = useState({ todo: '', progress: '', done: '' });
    const [draggedCard, setDraggedCard] = useState(null);

    const content = {
        columns: node.content?.columns ?? DEFAULT_COLUMNS,
    };

    // Auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            updateNode(node._id, { content });
        }, 500);
        return () => clearTimeout(timer);
    }, [JSON.stringify(content)]);

    const save = (columns) => {
        updateNodeLocal(node._id, { content: { columns } });
    };

    const addCard = (colId) => {
        const text = newCardText[colId]?.trim();
        if (!text) return;
        const newColumns = content.columns.map(col => {
            if (col.id === colId) {
                return { ...col, cards: [...col.cards, { id: Date.now().toString(), text }] };
            }
            return col;
        });
        save(newColumns);
        setNewCardText(prev => ({ ...prev, [colId]: '' }));
    };

    const removeCard = (colId, cardId) => {
        const newColumns = content.columns.map(col => {
            if (col.id === colId) {
                return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
            }
            return col;
        });
        save(newColumns);
    };

    const handleDragStart = (colId, cardId) => {
        setDraggedCard({ colId, cardId });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (targetColId) => {
        if (!draggedCard || draggedCard.colId === targetColId) {
            setDraggedCard(null);
            return;
        }

        const sourceCol = content.columns.find(c => c.id === draggedCard.colId);
        const card = sourceCol?.cards.find(c => c.id === draggedCard.cardId);
        if (!card) return;

        const newColumns = content.columns.map(col => {
            if (col.id === draggedCard.colId) {
                return { ...col, cards: col.cards.filter(c => c.id !== draggedCard.cardId) };
            }
            if (col.id === targetColId) {
                return { ...col, cards: [...col.cards, card] };
            }
            return col;
        });

        save(newColumns);
        setDraggedCard(null);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 text-center">
                <span className="text-sm font-semibold">📋 Kanban Board</span>
            </div>

            {/* Columns */}
            <div className="flex-1 flex gap-1 p-2 overflow-x-auto">
                {content.columns.map(col => (
                    <div
                        key={col.id}
                        className="flex-1 min-w-[120px] flex flex-col bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(col.id)}
                    >
                        {/* Column header */}
                        <div className="p-2 text-center border-b-2" style={{ borderColor: col.color }}>
                            <span className="text-xs font-bold" style={{ color: col.color }}>
                                {col.title}
                            </span>
                            <span className="ml-1 text-[10px] text-gray-400">
                                ({col.cards.length})
                            </span>
                        </div>

                        {/* Cards */}
                        <div className="flex-1 p-1 space-y-1 overflow-y-auto">
                            {col.cards.map(card => (
                                <div
                                    key={card.id}
                                    draggable
                                    onDragStart={() => handleDragStart(col.id, card.id)}
                                    className="group flex items-start gap-1 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow text-xs"
                                >
                                    <GripVertical size={10} className="text-gray-300 mt-0.5 flex-shrink-0" />
                                    <span className="flex-1 break-words">{card.text}</span>
                                    <button
                                        onClick={() => removeCard(col.id, card.id)}
                                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 dark:hover:bg-red-900 rounded flex-shrink-0"
                                    >
                                        <X size={10} className="text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add card */}
                        <div className="p-1">
                            <div className="flex gap-1">
                                <input
                                    type="text"
                                    value={newCardText[col.id] || ''}
                                    onChange={(e) => setNewCardText(prev => ({ ...prev, [col.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && addCard(col.id)}
                                    placeholder="Add..."
                                    className="flex-1 px-2 py-1 text-[10px] rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none"
                                />
                                <button
                                    onClick={() => addCard(col.id)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                    <Plus size={12} style={{ color: col.color }} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
