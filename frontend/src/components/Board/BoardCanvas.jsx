import { useEffect, useState } from 'react';
import { Copy, Trash2, Lock, Unlock } from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import { useNodeStore } from '../../store/useNodeStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import DraggableNode from '../Nodes/DraggableNode';
import StickyNote from '../Nodes/StickyNote';
import ContextMenu from '../Common/ContextMenu';
import FloatingAddButton from './FloatingAddButton';

export default function BoardCanvas({ boardId }) {
    const { currentBoard, fetchBoard } = useBoardStore();
    const { nodes, fetchNodes, deleteNode, createNode, updateNode, selectedNode, selectNode, clearSelection } = useNodeStore();
    const [contextMenu, setContextMenu] = useState(null);

    useEffect(() => {
        if (boardId) {
            fetchBoard(boardId);
            fetchNodes(boardId);
        }
    }, [boardId]);

    // Render node component based on type
    const renderNodeContent = (node) => {
        switch (node.type) {
            case 'sticky':
                return <StickyNote node={node} />;
            case 'tasklist':
                return <div className="p-4 text-sm">Task List (Coming soon)</div>;
            case 'pomodoro':
                return <div className="p-4 text-sm">Pomodoro Timer (Coming soon)</div>;
            case 'code':
                return <div className="p-4 text-sm">Code Block (Coming soon)</div>;
            default:
                return <div className="p-4 text-sm">Unknown node type: {node.type}</div>;
        }
    };

    // Context menu handler
    const handleContextMenu = (e, node) => {
        e.preventDefault();
        selectNode(node);
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            node,
        });
    };

    // Duplicate node
    const duplicateNode = async (node) => {
        await createNode({
            ...node,
            _id: undefined,
            position: {
                ...node.position,
                x: node.position.x + 20,
                y: node.position.y + 20,
                zIndex: Date.now(),
            },
        });
    };

    // Toggle lock
    const toggleLock = async (node) => {
        await updateNode(node._id, {
            locked: !node.locked,
        });
    };

    // Context menu options
    const getContextMenuOptions = (node) => [
        {
            label: 'Duplicate',
            icon: <Copy size={16} />,
            action: () => duplicateNode(node),
            shortcut: '⌘D',
        },
        {
            label: node.locked ? 'Unlock' : 'Lock',
            icon: node.locked ? <Unlock size={16} /> : <Lock size={16} />,
            action: () => toggleLock(node),
            shortcut: '⌘L',
        },
        { divider: true },
        {
            label: 'Delete',
            icon: <Trash2 size={16} />,
            action: () => deleteNode(node._id),
            danger: true,
            shortcut: 'Del',
        },
    ];

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 'Delete',
            ctrl: false,
            shift: false,
            alt: false,
            action: () => {
                if (selectedNode) {
                    deleteNode(selectedNode._id);
                }
            },
        },
        {
            key: 'Backspace',
            ctrl: false,
            shift: false,
            alt: false,
            action: () => {
                if (selectedNode) {
                    deleteNode(selectedNode._id);
                }
            },
        },
        {
            key: 'd',
            ctrl: true,
            shift: false,
            alt: false,
            action: () => {
                if (selectedNode) {
                    duplicateNode(selectedNode);
                }
            },
        },
        {
            key: 'l',
            ctrl: true,
            shift: false,
            alt: false,
            action: () => {
                if (selectedNode) {
                    toggleLock(selectedNode);
                }
            },
        },
        {
            key: 'Escape',
            ctrl: false,
            shift: false,
            alt: false,
            action: () => {
                clearSelection();
                setContextMenu(null);
            },
        },
    ]);

    // Click on canvas to deselect
    const handleCanvasClick = (e) => {
        if (e.target === e.currentTarget) {
            clearSelection();
        }
    };

    return (
        <div className="flex-1 relative overflow-hidden">
            {/* Grid background */}
            <div
                className="absolute inset-0 dark:opacity-50"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgb(0 0 0 / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(0 0 0 / 0.05) 1px, transparent 1px)
          `,
                    backgroundSize: '20px 20px',
                }}
            />

            {/* Nodes container */}
            <div
                className="absolute inset-0 p-8"
                onClick={handleCanvasClick}
            >
                {nodes.length === 0 && (
                    <div className="flex items-center justify-center h-full pointer-events-none">
                        <div className="text-center text-light-text-secondary dark:text-dark-text-secondary">
                            <p className="text-lg mb-2">Empty board</p>
                            <p className="text-sm">Click the + button to add a node</p>
                        </div>
                    </div>
                )}

                {/* Render nodes */}
                {nodes.map((node) => (
                    <div
                        key={node._id}
                        onContextMenu={(e) => handleContextMenu(e, node)}
                    >
                        <DraggableNode node={node}>
                            {renderNodeContent(node)}
                        </DraggableNode>
                    </div>
                ))}
            </div>

            {/* Floating add button */}
            <FloatingAddButton />

            {/* Context menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    options={getContextMenuOptions(contextMenu.node)}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}
