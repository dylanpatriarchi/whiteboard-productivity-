import { useRef, useState } from 'react';
import { useNodeStore } from '../../store/useNodeStore';

export default function DraggableNode({ node, children }) {
    const { updateNodeLocal, updateNode, selectNode, selectedNode } = useNodeStore();
    const nodeRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const resizeStartSize = useRef({ width: 0, height: 0 });

    const isSelected = selectedNode?._id === node._id;

    // Drag handlers
    const handleMouseDown = (e) => {
        if (e.target.closest('.resize-handle') || e.target.closest('.no-drag')) return;
        if (e.button !== 0) return; // Only left click

        e.preventDefault();
        setIsDragging(true);
        selectNode(node);

        dragStartPos.current = {
            x: e.clientX - node.position.x,
            y: e.clientY - node.position.y,
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isDragging && !isResizing) return;

        if (isDragging) {
            const newX = e.clientX - dragStartPos.current.x;
            const newY = e.clientY - dragStartPos.current.y;

            updateNodeLocal(node._id, {
                position: { ...node.position, x: newX, y: newY },
            });
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            // Save to backend
            updateNode(node._id, {
                position: node.position,
            });
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Resize handlers
    const handleResizeStart = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);

        resizeStartSize.current = {
            width: node.size.width,
            height: node.size.height,
            startX: e.clientX,
            startY: e.clientY,
            direction,
        };

        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    };

    const handleResizeMove = (e) => {
        if (!isResizing) return;

        const { width, height, startX, startY, direction } = resizeStartSize.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newWidth = width;
        let newHeight = height;
        let newX = node.position.x;
        let newY = node.position.y;

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
                newX = node.position.x + deltaX;
            }
        }
        if (direction.includes('n')) {
            const heightChange = height - deltaY;
            if (heightChange >= 150) {
                newHeight = heightChange;
                newY = node.position.y + deltaY;
            }
        }

        updateNodeLocal(node._id, {
            size: { width: newWidth, height: newHeight },
            position: { ...node.position, x: newX, y: newY },
        });
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
        updateNode(node._id, {
            size: node.size,
            position: node.position,
        });

        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };

    return (
        <div
            ref={nodeRef}
            className={`absolute card cursor-move select-none transition-shadow ${isSelected ? 'ring-2 ring-black dark:ring-white shadow-lg' : ''
                } ${isDragging || isResizing ? 'dragging' : ''}`}
            style={{
                left: node.position.x,
                top: node.position.y,
                width: node.size.width,
                height: node.size.height,
                zIndex: node.position.zIndex,
                backgroundColor: node.style?.backgroundColor,
            }}
            onMouseDown={handleMouseDown}
        >
            {children}

            {/* Resize handles */}
            {isSelected && (
                <>
                    {/* Corner handles */}
                    <div
                        className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-black dark:bg-white rounded-full cursor-se-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                    />
                    <div
                        className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-black dark:bg-white rounded-full cursor-ne-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                    />
                    <div
                        className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-black dark:bg-white rounded-full cursor-sw-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                    />
                    <div
                        className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-black dark:bg-white rounded-full cursor-nw-resize"
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
