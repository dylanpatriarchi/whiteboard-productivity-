import Settings from '../models/Settings.js';

// Proxy chat to OpenAI - keeps API key server-side
export const chat = async (req, res) => {
    try {
        const { messages, model } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Get API key from settings
        const settings = await Settings.findById('global-settings');
        const apiKey = settings?.apiKeys?.openai?.key;

        if (!apiKey) {
            return res.status(400).json({ error: 'OpenAI API key not configured. Go to Settings to add it.' });
        }

        const useModel = model || settings?.apiKeys?.openai?.model || 'gpt-3.5-turbo';

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: useModel,
                messages,
                max_tokens: 2048,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData?.error?.message || `OpenAI API error: ${response.status}`;
            return res.status(response.status).json({ error: errorMsg });
        }

        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message?.content || 'No response';

        res.json({
            message: assistantMessage,
            model: useModel,
            usage: data.usage,
        });
    } catch (error) {
        console.error('AI Chat error:', error);
        res.status(500).json({ error: error.message });
    }
};
