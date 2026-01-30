import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Untitled Board'
    },
    description: {
        type: String,
        default: ''
    },
    backgroundColor: {
        type: String,
        default: '#ffffff'
    },
    gridSize: {
        type: Number,
        default: 20
    },
    tags: [{
        type: String
    }],
    settings: {
        snapToGrid: {
            type: Boolean,
            default: false
        },
        showGrid: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Board', boardSchema);
