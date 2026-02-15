import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { retry } from '../utils/retry';

@Injectable()
export class GroqClient {
  private readonly groq = new Groq({
    apiKey: process.env.GROK_API_KEY,
  });

  async generateJsonResponse<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    expectedTemplate: string,
    maxAttempts = 3,
  ): Promise<T> {
    return retry(async () => {
      const completion = await this.groq.chat.completions.create({
        model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Tu es un assistant qui renvoie uniquement du JSON valide.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content?.trim();
      const cleaned = response
        ?.replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(cleaned || '{}');
      const validated = schema.parse(parsed);

      if (validated['template'] !== expectedTemplate) {
        throw new Error('Template mismatch');
      }

      return validated;
    }, maxAttempts);
  }
}
