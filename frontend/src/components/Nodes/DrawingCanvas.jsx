import { useState, useEffect, useRef, useCallback } from 'react';
import { Pencil, Eraser, Trash2 } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';

const COLORS = ['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff'];

export default function DrawingCanvas({ node }) {
    const { updateNodeLocal, updateNode } = useNodeStore();
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef(null);

    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(3);

    const content = {
        strokes: node.content?.strokes ?? [],
        backgroundColor: node.content?.backgroundColor ?? '#ffffff',
    };

    const contentRef = useRef(content);
    contentRef.current = content;

    // Auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            updateNode(node._id, { content: contentRef.current });
        }, 1000);
        return () => clearTimeout(timer);
    }, [JSON.stringify(content.strokes)]);

    // Draw all strokes
    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = content.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const stroke of content.strokes) {
            if (stroke.points.length < 2) continue;
            ctx.beginPath();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (stroke.tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
        }

        ctx.globalCompositeOperation = 'source-over';
    }, [content.strokes, content.backgroundColor]);

    // Resize canvas and redraw
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        redraw();
    }, [node.size]);

    useEffect(() => {
        redraw();
    }, [redraw]);

    const getCanvasPoint = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const startDrawing = (e) => {
        isDrawingRef.current = true;
        const point = getCanvasPoint(e);
        lastPointRef.current = point;

        const newStroke = {
            tool,
            color: tool === 'eraser' ? '#ffffff' : color,
            size: tool === 'eraser' ? brushSize * 3 : brushSize,
            points: [point],
        };

        const newStrokes = [...contentRef.current.strokes, newStroke];
        updateNodeLocal(node._id, { content: { ...contentRef.current, strokes: newStrokes } });
    };

    const draw = (e) => {
        if (!isDrawingRef.current) return;
        const point = getCanvasPoint(e);

        const strokes = [...contentRef.current.strokes];
        const lastStroke = { ...strokes[strokes.length - 1] };
        lastStroke.points = [...lastStroke.points, point];
        strokes[strokes.length - 1] = lastStroke;

        updateNodeLocal(node._id, { content: { ...contentRef.current, strokes } });

        // Draw incrementally for performance
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.strokeStyle = lastStroke.color;
        ctx.lineWidth = lastStroke.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (lastStroke.tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        }

        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';

        lastPointRef.current = point;
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
        lastPointRef.current = null;
    };

    const clearCanvas = () => {
        updateNodeLocal(node._id, { content: { ...contentRef.current, strokes: [] } });
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
            {/* Toolbar */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap bg-gray-50 dark:bg-gray-900">
                {/* Tools */}
                <button
                    onClick={() => setTool('pen')}
                    className={`p-1.5 rounded transition-colors ${tool === 'pen' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    title="Pen"
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={() => setTool('eraser')}
                    className={`p-1.5 rounded transition-colors ${tool === 'eraser' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    title="Eraser"
                >
                    <Eraser size={14} />
                </button>

                {/* Separator */}
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />

                {/* Colors */}
                {tool === 'pen' && (
                    <div className="flex gap-1">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-4 h-4 rounded-full border ${color === c ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-gray-300'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                )}

                {/* Separator */}
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />

                {/* Brush size */}
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-16 h-4"
                    title={`Size: ${brushSize}px`}
                />
                <span className="text-[10px] text-gray-500 w-5">{brushSize}</span>

                {/* Clear */}
                <button
                    onClick={clearCanvas}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500 ml-auto"
                    title="Clear canvas"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />
            </div>
        </div>
    );
}
