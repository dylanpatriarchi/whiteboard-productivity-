import Settings from '../models/Settings.js';

// Get settings (singleton)
export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findById('global-settings');

        // Create default settings if none exist
        if (!settings) {
            settings = new Settings({ _id: 'global-settings' });
            await settings.save();
        }

        // Don't send API keys to frontend
        const response = settings.toObject();
        if (response.apiKeys) {
            response.apiKeys = {
                openai: { enabled: response.apiKeys.openai?.enabled || false, model: response.apiKeys.openai?.model },
                anthropic: { enabled: response.apiKeys.anthropic?.enabled || false, model: response.apiKeys.anthropic?.model },
                custom: { enabled: response.apiKeys.custom?.enabled || false }
            };
        }

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update settings
export const updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findById('global-settings');

        if (!settings) {
            settings = new Settings({ _id: 'global-settings', ...req.body });
        } else {
            // Smart update to preserve keys if not provided
            if (req.body.apiKeys) {
                if (req.body.apiKeys.openai) {
                    settings.apiKeys.openai.model = req.body.apiKeys.openai.model || settings.apiKeys.openai.model;
                    if (req.body.apiKeys.openai.key) {
                        settings.apiKeys.openai.key = req.body.apiKeys.openai.key;
                        settings.apiKeys.openai.enabled = true;
                    }
                    if (req.body.apiKeys.openai.hasOwnProperty('enabled')) {
                        settings.apiKeys.openai.enabled = req.body.apiKeys.openai.enabled;
                    }
                }
                // Handle other providers similarly if needed
            }

            // Handle preferences
            if (req.body.preferences) {
                settings.preferences = { ...settings.preferences.toObject(), ...req.body.preferences };
            }
        }

        await settings.save();

        // Return masked response
        const response = settings.toObject();
        if (response.apiKeys) {
            response.apiKeys = {
                openai: { enabled: response.apiKeys.openai?.enabled || false, model: response.apiKeys.openai?.model },
                anthropic: { enabled: response.apiKeys.anthropic?.enabled || false, model: response.apiKeys.anthropic?.model },
                custom: { enabled: response.apiKeys.custom?.enabled || false }
            };
        }

        res.json(response);
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(400).json({ error: error.message });
    }
};

// Update theme only
export const updateTheme = async (req, res) => {
    try {
        const { theme } = req.body;
        const settings = await Settings.findByIdAndUpdate(
            'global-settings',
            { 'preferences.theme': theme },
            { new: true, upsert: true }
        );

        res.json({ theme: settings.preferences.theme });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
