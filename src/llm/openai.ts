import { config } from '../config';

export async function generateWithOpenAI(prompt: string, apiKey?: string, systemPrompt?: string): Promise<string> {
  const key = apiKey || config.openaiApiKey;
  const sysPrompt = systemPrompt || 'You are a helpful assistant that answers questions using only the provided context.';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: config.generationModel,
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.2,
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  return data.choices[0].message.content.trim();
}
