import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'sticky', 'tasklist', 'code', 'pomodoro', 'ai-chat', 'aichat',
            'reminder', 'kanban', 'markdown', 'texteditor', 'canvas', 'drawing', 'bookmark',
            'chart', 'calendar', 'mindmap', 'habit-tracker', 'spreadsheet',
            'file', 'image', 'embed', 'voice-note', 'gallery', 'calculator'
        ]
    },
    position: {
        x: {
            type: Number,
            required: true,
            default: 0
        },
        y: {
            type: Number,
            required: true,
            default: 0
        },
        zIndex: {
            type: Number,
            default: 1
        }
    },
    size: {
        width: {
            type: Number,
            default: 300
        },
        height: {
            type: Number,
            default: 200
        }
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    style: {
        backgroundColor: String,
        borderColor: String,
        fontSize: Number,
        fontFamily: String
    },
    locked: {
        type: Boolean,
        default: false
    },
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node'
    }]
}, {
    timestamps: true
});

// Index for faster queries
nodeSchema.index({ boardId: 1 });
nodeSchema.index({ type: 1 });

export default mongoose.model('Node', nodeSchema);
