import express from 'express';
import {
    getAllBoards,
    getBoardById,
    createBoard,
    updateBoard,
    deleteBoard
} from '../controllers/boardController.js';

const router = express.Router();

router.get('/', getAllBoards);
router.get('/:id', getBoardById);
router.post('/', createBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

export default router;
