import { NextResponse } from 'next/server';
import { z } from 'zod';
import { anthropic, extractJson, MODEL } from '@/lib/claude';
import { IDENTIFY_SYSTEM } from '@/lib/prompts';
import type { Product } from '@/lib/types';

export const maxDuration = 60;

const Z = z.object({
  name: z.string().optional(),
  brand: z.string().nullish(),
  quantity: z.number().nullish(),
  unit: z.enum(['ml', 'g', 'blade', 'item']).nullish(),
  gender_target: z.enum(['female', 'male', 'neutral', 'unknown']).nullish(),
  price_gbp: z.number().nullish(),
  error: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { image } = (await req.json()) as { image: string };
    if (!image) return NextResponse.json({ error: 'No image received.' });
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Scanning needs live AI, which is not switched on in this demo. Type the product name on the Search tab instead.' });

    let text = '';
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 500,
        system: IDENTIFY_SYSTEM,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
              { type: 'text', text: attempt ? 'Return valid JSON only.' : 'Identify this product.' },
            ],
          },
        ],
      });
      text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('\n');
      try {
        const d = extractJson(text, Z);
        if (d.error || !d.name) return NextResponse.json({ error: d.error ?? 'Could not read the product.' });
        const product: Product = {
          name: d.name,
          brand: d.brand ?? undefined,
          quantity: d.quantity ?? null,
          unit: d.unit ?? undefined,
          gender_target: d.gender_target ?? 'unknown',
          price_gbp: d.price_gbp ?? null,
          source: d.price_gbp != null ? 'photo' : undefined,
          checked_on: d.price_gbp != null ? new Date().toISOString().slice(0, 10) : undefined,
        };
        return NextResponse.json({ product });
      } catch {
        /* retry once */
      }
    }
    return NextResponse.json({ error: "We couldn't read that product." });
  } catch {
    return NextResponse.json({ error: 'Something went wrong reading the photo.' });
  }
}
