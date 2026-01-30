import Board from '../models/Board.js';

// Get all boards
export const getAllBoards = async (req, res) => {
    try {
        const boards = await Board.find().sort({ updatedAt: -1 });
        res.json(boards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single board by ID
export const getBoardById = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.json(board);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new board
export const createBoard = async (req, res) => {
    try {
        const board = new Board(req.body);
        await board.save();
        res.status(201).json(board);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update board
export const updateBoard = async (req, res) => {
    try {
        const board = await Board.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.json(board);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete board
export const deleteBoard = async (req, res) => {
    try {
        const board = await Board.findByIdAndDelete(req.params.id);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.json({ message: 'Board deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
