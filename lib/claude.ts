import Anthropic from '@anthropic-ai/sdk';
import type { ZodType } from 'zod';

// Server only. Never import this file from a client component.
export const MODEL = 'claude-sonnet-5-5';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Strip code fences, slice first "{" to last "}", JSON.parse, zod-validate. Throws on failure. */
export function extractJson<T>(text: string, schema: ZodType<T>): T {
  const cleaned = text.replace(/```(?:json)?/gi, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No JSON object found in model output');
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  return schema.parse(parsed);
}
