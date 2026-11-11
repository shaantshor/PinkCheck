import { NextResponse } from 'next/server';
import { anthropic, extractJson, MODEL } from '@/lib/claude';
import { ReceiptZ } from '@/lib/receipt/schema';
import { RECEIPT_SYSTEM_PROMPT, RECEIPT_USER_PROMPT } from '@/lib/receipt/prompts';

export const maxDuration = 60;

const FRIENDLY = "We couldn't read that receipt. Try a flatter, brighter photo.";
const fail = (message = FRIENDLY, status = 422) => NextResponse.json({ error: message }, { status });

type Msg = { role: 'user' | 'assistant'; content: unknown };

export async function POST(req: Request) {
  let image: string;
  try {
    image = ((await req.json()) as { image?: string }).image ?? '';
    image = image.replace(/^data:image\/\w+;base64,/, '');
    if (!image) throw new Error('missing image');
  } catch {
    return fail('Please upload a photo of your receipt.', 400);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail('Receipt reading is not set up yet. Please try again later.', 503);
  }

  const messages: Msg[] = [
    {
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
        { type: 'text', text: RECEIPT_USER_PROMPT },
      ],
    },
  ];

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 3000,
        system: RECEIPT_SYSTEM_PROMPT,
        messages: messages as Parameters<typeof anthropic.messages.create>[0]['messages'],
      } as Parameters<typeof anthropic.messages.create>[0] & { stream?: false });
      const text = (res as { content: { type: string; text?: string }[] }).content
        .filter((b) => b.type === 'text')
        .map((b) => b.text ?? '')
        .join('\n');
      try {
        const parsed = extractJson(text, ReceiptZ);
        if (parsed.items.length === 0) return fail();
        return NextResponse.json(parsed);
      } catch {
        messages.push({ role: 'assistant', content: text || '(empty)' });
        messages.push({ role: 'user', content: 'Return valid JSON only.' });
      }
    }
    return fail();
  } catch {
    return fail();
  }
}
