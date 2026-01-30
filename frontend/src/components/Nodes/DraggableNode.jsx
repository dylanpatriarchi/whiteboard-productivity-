import { useRef, useEffect, useState } from 'react';
import { useNodeStore } from '../../store/useNodeStore';

export default function DraggableNode({ node, children }) {
    const { updateNodeLocal, updateNode, selectNode, selectedNode, deselectNode } = useNodeStore();
    const nodeRef = useRef(null);
    const isDraggingRef = useRef(false);
    const isResizingRef = useRef(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const resizeStartData = useRef(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const isSelected = selectedNode?._id === node._id;

    // Double-click to enable edit mode (drag & resize)
    const handleDoubleClick = (e) => {
        e.stopPropagation();
        setIsEditMode(true);
        selectNode(node);
    };

    // Click outside to disable edit mode
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (nodeRef.current && !nodeRef.current.contains(e.target)) {
                setIsEditMode(false);
            }
        };

        if (isEditMode) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isEditMode]);

    // Drag handlers - only work in edit mode
    const handleMouseDown = (e) => {
        if (!isEditMode) return; // Only drag in edit mode
        if (e.target.closest('.resize-handle') || e.target.closest('.no-drag')) return;
        if (e.button !== 0) return; // Only left click

        e.preventDefault();
        e.stopPropagation();
        isDraggingRef.current = true;

        dragStartPos.current = {
            x: e.clientX - node.position.x,
            y: e.clientY - node.position.y,
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (isDraggingRef.current) {
            const newX = e.clientX - dragStartPos.current.x;
            const newY = e.clientY - dragStartPos.current.y;

            updateNodeLocal(node._id, {
                position: { ...node.position, x: newX, y: newY },
            });
        } else if (isResizingRef.current && resizeStartData.current) {
            const { width, height, startX, startY, direction, posX, posY } = resizeStartData.current;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newWidth = width;
            let newHeight = height;
            let newX = posX;
            let newY = posY;

            if (direction.includes('e')) {
                newWidth = Math.max(200, width + deltaX);
            }
            if (direction.includes('s')) {
                newHeight = Math.max(150, height + deltaY);
            }
            if (direction.includes('w')) {
                const widthChange = width - deltaX;
                if (widthChange >= 200) {
                    newWidth = widthChange;
                    newX = posX + deltaX;
                }
            }
            if (direction.includes('n')) {
                const heightChange = height - deltaY;
                if (heightChange >= 150) {
                    newHeight = heightChange;
                    newY = posY + deltaY;
                }
            }

            updateNodeLocal(node._id, {
                size: { width: newWidth, height: newHeight },
                position: { ...node.position, x: newX, y: newY },
            });
        }
    };

    const handleMouseUp = () => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;

            // Get the updated node from store (not the stale prop)
            const { nodes } = useNodeStore.getState();
            const updatedNode = nodes.find(n => n._id === node._id);

            if (updatedNode) {
                // Save to backend with the UPDATED position
                updateNode(node._id, {
                    position: updatedNode.position,
                });
            }
        } else if (isResizingRef.current) {
            isResizingRef.current = false;
            resizeStartData.current = null;

            // Get the updated node from store
            const { nodes } = useNodeStore.getState();
            const updatedNode = nodes.find(n => n._id === node._id);

            if (updatedNode) {
                updateNode(node._id, {
                    size: updatedNode.size,
                    position: updatedNode.position,
                });
            }
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Resize handlers
    const handleResizeStart = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();
        isResizingRef.current = true;

        resizeStartData.current = {
            width: node.size.width,
            height: node.size.height,
            startX: e.clientX,
            startY: e.clientY,
            posX: node.position.x,
            posY: node.position.y,
            direction,
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <div
            ref={nodeRef}
            className={`absolute card select-none transition-shadow ${isEditMode ? 'cursor-move ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg' : 'cursor-default'
                } ${isDraggingRef.current || isResizingRef.current ? 'dragging' : ''}`}
            style={{
                left: node.position.x,
                top: node.position.y,
                width: node.size.width,
                height: node.size.height,
                zIndex: node.position.zIndex,
                backgroundColor: node.style?.backgroundColor,
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {children}

            {/* Resize handles - only in edit mode */}
            {isEditMode && (
                <>
                    {/* Corner handles */}
                    <div
                        className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-se-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                    />
                    <div
                        className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-ne-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                    />
                    <div
                        className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-sw-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                    />
                    <div
                        className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-nw-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                    />

                    {/* Edge handles */}
                    <div
                        className="resize-handle absolute top-0 right-0 bottom-0 w-1 cursor-e-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'e')}
                    />
                    <div
                        className="resize-handle absolute bottom-0 left-0 right-0 h-1 cursor-s-resize"
                        onMouseDown={(e) => handleResizeStart(e, 's')}
                    />
                </>
            )}
        </div>
    );
}
