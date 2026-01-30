import { create } from 'zustand';

// Load initial viewport from localStorage
const loadViewport = () => {
    try {
        const saved = localStorage.getItem('canvas-viewport');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error('Failed to load viewport:', error);
    }
    return { scale: 1, offsetX: 0, offsetY: 0 };
};

// Save viewport to localStorage
const saveViewport = (scale, offsetX, offsetY) => {
    try {
        localStorage.setItem('canvas-viewport', JSON.stringify({ scale, offsetX, offsetY }));
    } catch (error) {
        console.error('Failed to save viewport:', error);
    }
};

const initialViewport = loadViewport();

export const useCanvasStore = create((set, get) => ({
    // Canvas transform - load from localStorage
    scale: initialViewport.scale,
    offsetX: initialViewport.offsetX,
    offsetY: initialViewport.offsetY,

    // Zoom in
    zoomIn: () => {
        const newScale = Math.min(get().scale * 1.2, 5);
        set({ scale: newScale });
        saveViewport(newScale, get().offsetX, get().offsetY);
    },

    // Zoom out
    zoomOut: () => {
        const newScale = Math.max(get().scale / 1.2, 0.1);
        set({ scale: newScale });
        saveViewport(newScale, get().offsetX, get().offsetY);
    },

    // Set zoom to specific value with optional mouse position for zoom-to-cursor
    setZoom: (newScale, mouseX, mouseY) => {
        const state = get();
        const clampedScale = Math.max(0.1, Math.min(5, newScale));

        // If mouse position provided, zoom towards cursor
        if (mouseX !== undefined && mouseY !== undefined) {
            // Calculate the point in canvas space that's under the cursor
            const canvasX = (mouseX - state.offsetX) / state.scale;
            const canvasY = (mouseY - state.offsetY) / state.scale;

            // Calculate new offset to keep that point under the cursor
            const newOffsetX = mouseX - canvasX * clampedScale;
            const newOffsetY = mouseY - canvasY * clampedScale;

            set({
                scale: clampedScale,
                offsetX: newOffsetX,
                offsetY: newOffsetY
            });
            saveViewport(clampedScale, newOffsetX, newOffsetY);
        } else {
            set({ scale: clampedScale });
            saveViewport(clampedScale, state.offsetX, state.offsetY);
        }
    },

    // Reset zoom
    resetZoom: () => {
        set({ scale: 1, offsetX: 0, offsetY: 0 });
        saveViewport(1, 0, 0);
    },

    // Pan canvas
    pan: (deltaX, deltaY) => {
        const newOffsetX = get().offsetX + deltaX;
        const newOffsetY = get().offsetY + deltaY;
        set({
            offsetX: newOffsetX,
            offsetY: newOffsetY,
        });
        saveViewport(get().scale, newOffsetX, newOffsetY);
    },

    // Set pan offset
    setOffset: (offsetX, offsetY) => {
        set({ offsetX, offsetY });
        saveViewport(get().scale, offsetX, offsetY);
    },
}));
