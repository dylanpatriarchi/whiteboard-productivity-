import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    // Singleton document - only one settings document exists
    _id: {
        type: String,
        default: 'global-settings'
    },
    apiKeys: {
        openai: {
            key: String, // Will be encrypted
            model: {
                type: String,
                default: 'gpt-3.5-turbo'
            },
            enabled: {
                type: Boolean,
                default: false
            }
        },
        anthropic: {
            key: String, // Will be encrypted
            model: {
                type: String,
                default: 'claude-3-sonnet-20240229'
            },
            enabled: {
                type: Boolean,
                default: false
            }
        },
        custom: {
            endpoint: String,
            key: String, // Will be encrypted
            enabled: {
                type: Boolean,
                default: false
            }
        }
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
        },
        autosaveInterval: {
            type: Number,
            default: 30 // seconds
        },
        defaultBoardBackground: {
            type: String,
            default: '#ffffff'
        },
        pomodoroDefaults: {
            workDuration: {
                type: Number,
                default: 25 // minutes
            },
            breakDuration: {
                type: Number,
                default: 5
            },
            longBreakDuration: {
                type: Number,
                default: 15
            }
        },
        codeExecutionTimeout: {
            type: Number,
            default: 10 // seconds
        },
        notifications: {
            enabled: {
                type: Boolean,
                default: true
            },
            sound: {
                type: Boolean,
                default: true
            }
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Settings', settingsSchema);
