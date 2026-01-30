import { create } from 'zustand';
import api from '../services/api';

export const useBoardStore = create((set, get) => ({
    boards: [],
    currentBoard: null,
    loading: false,
    error: null,

    // Fetch all boards
    fetchBoards: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/boards');
            set({ boards: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Fetch single board
    fetchBoard: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/boards/${id}`);
            set({ currentBoard: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Create board
    createBoard: async (boardData) => {
        try {
            const response = await api.post('/boards', boardData);
            set((state) => ({ boards: [response.data, ...state.boards] }));
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Update board
    updateBoard: async (id, boardData) => {
        try {
            const response = await api.put(`/boards/${id}`, boardData);
            set((state) => ({
                boards: state.boards.map((b) => (b._id === id ? response.data : b)),
                currentBoard: state.currentBoard?._id === id ? response.data : state.currentBoard,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Delete board
    deleteBoard: async (id) => {
        try {
            await api.delete(`/boards/${id}`);
            set((state) => ({
                boards: state.boards.filter((b) => b._id !== id),
                currentBoard: state.currentBoard?._id === id ? null : state.currentBoard,
            }));
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Set current board
    setCurrentBoard: (board) => set({ currentBoard: board }),
}));
