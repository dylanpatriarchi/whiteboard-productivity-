import Node from '../models/Node.js';

// Get all nodes for a board
export const getNodesByBoard = async (req, res) => {
    try {
        const nodes = await Node.find({ boardId: req.params.boardId });
        res.json(nodes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single node
export const getNodeById = async (req, res) => {
    try {
        const node = await Node.findById(req.params.id);
        if (!node) {
            return res.status(404).json({ error: 'Node not found' });
        }
        res.json(node);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new node
export const createNode = async (req, res) => {
    try {
        const node = new Node(req.body);
        await node.save();
        res.status(201).json(node);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update node
export const updateNode = async (req, res) => {
    try {
        const node = await Node.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!node) {
            return res.status(404).json({ error: 'Node not found' });
        }
        res.json(node);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete node
export const deleteNode = async (req, res) => {
    try {
        const node = await Node.findByIdAndDelete(req.params.id);
        if (!node) {
            return res.status(404).json({ error: 'Node not found' });
        }
        res.json({ message: 'Node deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Bulk update nodes (for drag & drop)
export const bulkUpdateNodes = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { _id, position, size, etc. }

        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { _id: update._id },
                update: { $set: update }
            }
        }));

        await Node.bulkWrite(bulkOps);
        res.json({ message: 'Nodes updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
