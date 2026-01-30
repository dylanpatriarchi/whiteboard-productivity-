import { useEffect } from 'react';
import { useBoardStore } from '../../store/useBoardStore';
import { useNodeStore } from '../../store/useNodeStore';

export default function BoardCanvas({ boardId }) {
    const { currentBoard, fetchBoard } = useBoardStore();
    const { nodes, fetchNodes } = useNodeStore();

    useEffect(() => {
        if (boardId) {
            fetchBoard(boardId);
            fetchNodes(boardId);
        }
    }, [boardId]);

    return (
        <div className="flex-1 relative overflow-hidden">
            {/* Grid background */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgb(0 0 0 / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(0 0 0 / 0.05) 1px, transparent 1px)
          `,
                    backgroundSize: '20px 20px',
                }}
            />

            {/* Nodes will be rendered here */}
            <div className="absolute inset-0 p-8">
                {nodes.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-light-text-secondary dark:text-dark-text-secondary">
                            <p className="text-lg mb-2">Empty board</p>
                            <p className="text-sm">Add a node to get started</p>
                        </div>
                    </div>
                )}

                {/* Nodes will be mapped here in future */}
                {nodes.map((node) => (
                    <div
                        key={node._id}
                        className="absolute card p-4"
                        style={{
                            left: node.position.x,
                            top: node.position.y,
                            width: node.size.width,
                            height: node.size.height,
                            zIndex: node.position.zIndex,
                        }}
                    >
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            {node.type}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
