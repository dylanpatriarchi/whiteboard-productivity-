import { create } from 'zustand';
import api from '../services/api';

export const useNodeStore = create((set, get) => ({
    nodes: [],
    selectedNode: null,
    loading: false,
    error: null,

    // Fetch nodes for a board
    fetchNodes: async (boardId) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/nodes/board/${boardId}`);
            set({ nodes: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Create node
    createNode: async (nodeData) => {
        try {
            const response = await api.post('/nodes', nodeData);
            set((state) => ({ nodes: [...state.nodes, response.data] }));
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Update node
    updateNode: async (id, nodeData) => {
        try {
            const response = await api.put(`/nodes/${id}`, nodeData);
            set((state) => ({
                nodes: state.nodes.map((n) => (n._id === id ? response.data : n)),
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Update node locally (optimistic update)
    updateNodeLocal: (id, updates) => {
        set((state) => ({
            nodes: state.nodes.map((n) =>
                n._id === id ? {
                    ...n,
                    ...updates,
                    position: updates.position ? { ...n.position, ...updates.position } : n.position,
                    size: updates.size ? { ...n.size, ...updates.size } : n.size,
                    content: updates.content ? { ...n.content, ...updates.content } : n.content,
                } : n
            ),
        }));
    },

    // Delete node
    deleteNode: async (id) => {
        try {
            await api.delete(`/nodes/${id}`);
            set((state) => ({
                nodes: state.nodes.filter((n) => n._id !== id),
                selectedNode: state.selectedNode?._id === id ? null : state.selectedNode,
            }));
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Bulk update (for drag & drop)
    bulkUpdateNodes: async (updates) => {
        try {
            await api.post('/nodes/bulk-update', { updates });

            // Update local state
            set((state) => ({
                nodes: state.nodes.map((node) => {
                    const update = updates.find((u) => u._id === node._id);
                    return update ? { ...node, ...update } : node;
                }),
            }));
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Select node
    selectNode: (node) => set({ selectedNode: node }),

    // Clear selection
    clearSelection: () => set({ selectedNode: null }),

    // Clear all nodes
    clearNodes: () => set({ nodes: [], selectedNode: null }),
}));
