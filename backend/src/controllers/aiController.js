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
        const isNewModel = useModel.startsWith('gpt-5') || useModel.startsWith('o1');

        // Inject model identity into system prompt
        const systemMessageIndex = messages.findIndex(m => m.role === 'system');
        if (systemMessageIndex > -1) {
            messages[systemMessageIndex].content += `\nCurrent Model: ${useModel}. You are running on this specific model version.`;
        } else {
            messages.unshift({ role: 'system', content: `You are a helpful assistant running on ${useModel}.` });
        }

        const requestBody = {
            model: useModel,
            messages,
        };

        if (isNewModel) {
            requestBody.max_completion_tokens = 2048;
            // temperature defaults to 1 for new models, sending other values might error
            requestBody.temperature = 1;
        } else {
            requestBody.max_tokens = 2048;
            requestBody.temperature = 0.7;
        }

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
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
