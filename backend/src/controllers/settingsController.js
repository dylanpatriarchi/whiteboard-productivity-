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
        // TODO: Implement encryption for API keys before saving
        const settings = await Settings.findByIdAndUpdate(
            'global-settings',
            req.body,
            { new: true, upsert: true, runValidators: true }
        );

        res.json(settings);
    } catch (error) {
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
