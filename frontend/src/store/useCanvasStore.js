import { create } from 'zustand';

export const useCanvasStore = create((set, get) => ({
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
        } else {
            set({ scale: clampedScale });
        }
    },

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
