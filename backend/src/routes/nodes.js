import express from 'express';
import {
    getNodesByBoard,
    getNodeById,
    createNode,
    updateNode,
    deleteNode,
    bulkUpdateNodes
} from '../controllers/nodeController.js';

const router = express.Router();

router.get('/board/:boardId', getNodesByBoard);
router.get('/:id', getNodeById);
router.post('/', createNode);
router.put('/:id', updateNode);
router.delete('/:id', deleteNode);
router.post('/bulk-update', bulkUpdateNodes);

export default router;
