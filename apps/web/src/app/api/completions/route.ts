import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const schema = z.object({
  prompt: z.string(),
  model: z.enum(['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4-turbo-preview']),
});

export async function POST(req: Request) {
  const { prompt, model } = schema.parse(await req.json());

  const result = await streamText({
    model: openai(model),
    prompt,
  });

  return result.toAIStreamResponse();
}
