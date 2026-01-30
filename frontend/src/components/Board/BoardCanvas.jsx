import { useEffect, useState, useRef } from 'react';
import { Copy, Trash2, Lock, Unlock, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import { useNodeStore } from '../../store/useNodeStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import DraggableNode from '../Nodes/DraggableNode';
import StickyNote from '../Nodes/StickyNote';
import ContextMenu from '../Common/ContextMenu';
import FloatingAddButton from './FloatingAddButton';

export default function BoardCanvas({ boardId }) {
    const { currentBoard, fetchBoard } = useBoardStore();
    const { nodes, fetchNodes, deleteNode, createNode, updateNode, selectedNode, selectNode, clearSelection } = useNodeStore();
    const { scale, offsetX, offsetY, zoomIn, zoomOut, resetZoom, pan } = useCanvasStore();
    const [contextMenu, setContextMenu] = useState(null);
    const canvasRef = useRef(null);
    const isPanningRef = useRef(false);
    const panStartRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (boardId) {
            fetchBoard(boardId);
            fetchNodes(boardId);
        }
    }, [boardId]);

    // Mouse wheel zoom
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY;

                if (delta < 0) {
                    zoomIn();
                } else {
                    zoomOut();
                }
            }
        };

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
            return () => canvas.removeEventListener('wheel', handleWheel);
        }
    }, [zoomIn, zoomOut]);

    // Pan with left click on empty canvas area
    const handleCanvasMouseDown = (e) => {
        // Only pan on left click when clicking the nodes container itself (not a child like a node)
        if (e.button === 0 && (e.target.classList.contains('nodes-container') || e.target.classList.contains('canvas-bg'))) {
            e.preventDefault();
            e.stopPropagation();
            isPanningRef.current = true;
            panStartRef.current = { x: e.clientX, y: e.clientY };
            document.body.style.cursor = 'grabbing';

            // Add global listeners for smooth panning
            document.addEventListener('mousemove', handleMouseMoveGlobal);
            document.addEventListener('mouseup', handleMouseUpGlobal);
        }
    };

    const handleMouseMoveGlobal = (e) => {
        if (isPanningRef.current) {
            e.preventDefault();
            const deltaX = e.clientX - panStartRef.current.x;
            const deltaY = e.clientY - panStartRef.current.y;
            pan(deltaX, deltaY);
            panStartRef.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUpGlobal = () => {
        if (isPanningRef.current) {
            isPanningRef.current = false;
            document.body.style.cursor = '';

            // Remove global listeners
            document.removeEventListener('mousemove', handleMouseMoveGlobal);
            document.removeEventListener('mouseup', handleMouseUpGlobal);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.body.style.cursor = '';
            // Cleanup global listeners in case component unmounts while panning
            document.removeEventListener('mousemove', handleMouseMoveGlobal);
            document.removeEventListener('mouseup', handleMouseUpGlobal);
        };
    }, []);

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
        {
            key: '=',
            ctrl: true,
            shift: false,
            alt: false,
            action: () => zoomIn(),
        },
        {
            key: '-',
            ctrl: true,
            shift: false,
            alt: false,
            action: () => zoomOut(),
        },
        {
            key: '0',
            ctrl: true,
            shift: false,
            alt: false,
            action: () => resetZoom(),
        },
    ]);

    // Click on canvas to deselect
    const handleCanvasClick = (e) => {
        if (e.target === e.currentTarget) {
            clearSelection();
        }
    };

    return (
        <div
            className="flex-1 relative overflow-hidden"
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
        >
            {/* Zoom controls */}
            <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
                <button
                    onClick={zoomIn}
                    className="btn p-2 w-9 h-9 flex items-center justify-center"
                    title="Zoom in (Ctrl +)"
                >
                    <ZoomIn size={18} />
                </button>
                <button
                    onClick={zoomOut}
                    className="btn p-2 w-9 h-9 flex items-center justify-center"
                    title="Zoom out (Ctrl -)"
                >
                    <ZoomOut size={18} />
                </button>
                <button
                    onClick={resetZoom}
                    className="btn p-2 w-9 h-9 flex items-center justify-center"
                    title="Reset zoom (Ctrl 0)"
                >
                    <Maximize2 size={18} />
                </button>
                <div className="text-xs text-center mt-1 text-light-text-secondary dark:text-dark-text-secondary">
                    {Math.round(scale * 100)}%
                </div>
            </div>

            {/* Grid background */}
            <div
                className="absolute inset-0 dark:opacity-50"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgb(0 0 0 / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(0 0 0 / 0.05) 1px, transparent 1px)
          `,
                    backgroundSize: `${20 * scale}px ${20 * scale}px`,
                    backgroundPosition: `${offsetX}px ${offsetY}px`,
                }}
            />

            {/* Nodes container */}
            <div
                className="nodes-container absolute inset-0 p-8"
                style={{
                    transform: `scale(${scale}) translate(${offsetX / scale}px, ${offsetY / scale}px)`,
                    transformOrigin: '0 0',
                }}
                onClick={handleCanvasClick}
                onMouseDown={handleCanvasMouseDown}
            >
                {nodes.length === 0 && (
                    <div
                        className="flex items-center justify-center pointer-events-none"
                        style={{
                            height: `${window.innerHeight / scale}px`,
                            width: `${window.innerWidth / scale}px`,
                        }}
                    >
                        <div className="text-center text-light-text-secondary dark:text-dark-text-secondary">
                            <p className="text-lg mb-2">Empty board</p>
                            <p className="text-sm">Click the + button to add a node</p>
                            <p className="text-xs mt-2">Ctrl + Scroll to zoom • Click & Drag to pan</p>
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

