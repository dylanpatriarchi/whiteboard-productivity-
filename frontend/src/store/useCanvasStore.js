import { create } from 'zustand';

export const useCanvasStore = create((set) => ({
    // Canvas transform
    scale: 1,
    offsetX: 0,
    offsetY: 0,

    // Zoom in
    zoomIn: () => set((state) => ({
        scale: Math.min(state.scale * 1.2, 5) // Max 5x zoom
    })),

    // Zoom out
    zoomOut: () => set((state) => ({
        scale: Math.max(state.scale / 1.2, 0.1) // Min 0.1x zoom
    })),

    // Set zoom to specific value
    setZoom: (scale) => set({ scale: Math.max(0.1, Math.min(5, scale)) }),

    // Reset zoom
    resetZoom: () => set({ scale: 1, offsetX: 0, offsetY: 0 }),

    // Pan canvas
    pan: (deltaX, deltaY) => set((state) => ({
        offsetX: state.offsetX + deltaX,
        offsetY: state.offsetY + deltaY,
    })),

    // Set pan offset
    setOffset: (offsetX, offsetY) => set({ offsetX, offsetY }),
}));
