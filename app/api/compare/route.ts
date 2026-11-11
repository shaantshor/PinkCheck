import { NextResponse } from 'next/server';
import type { Comparison, Product } from '@/lib/types';
import { anthropic, extractJson, MODEL } from '@/lib/claude';
import { COMPARE_SYSTEM, compareUserPrompt } from '@/lib/prompts';
import { demoCompare, fromWeb, notEnoughData, WebZ } from '@/lib/compare';

export const maxDuration = 60;

const cache = new Map<string, Comparison>();
const TIMEOUT_MS = 25_000;

async function webCompare(input: Product): Promise<Comparison> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      { role: 'user', content: compareUserPrompt(input) },
    ];
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await anthropic.messages.create(
        {
          model: MODEL,
          max_tokens: 2000,
          system: COMPARE_SYSTEM,
          tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
          messages,
        } as Parameters<typeof anthropic.messages.create>[0] & { stream?: false },
        { signal: ctrl.signal },
      );
      const text = (res as { content: { type: string; text?: string }[] }).content
        .filter((b) => b.type === 'text')
        .map((b) => b.text ?? '')
        .join('\n');
      try {
        return fromWeb(input, extractJson(text, WebZ));
      } catch {
        messages.push({ role: 'assistant', content: text || '(empty)' });
        messages.push({ role: 'user', content: 'Return valid JSON only.' });
      }
    }
    return notEnoughData(input, "We couldn't read the search results. Try typing the product name instead.", true);
  } catch {
    return notEnoughData(
      input,
      'That took too long or search is unavailable. Try again, or try typing the product name instead.',
      true,
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  let product: Product;
  try {
    product = ((await req.json()) as { product: Product }).product;
    if (!product?.name?.trim()) throw new Error('missing name');
  } catch {
    return NextResponse.json(
      notEnoughData({ name: '' }, 'Please enter a product name.'),
    );
  }

  const priced = product.price_gbp != null && (product.source === 'photo' || product.source === 'receipt');
  const key = product.name.trim().toLowerCase();
  if (!priced && cache.has(key)) return NextResponse.json(cache.get(key));

  const demo = demoCompare(product);
  if (demo) {
    if (!priced) cache.set(key, demo);
    return NextResponse.json(demo);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      notEnoughData(product, 'Live search is not set up yet. Try one of the example products.'),
    );
  }
  const web = await webCompare(product);
  if (!priced && web.label !== 'Not enough data') cache.set(key, web);
  return NextResponse.json(web);
}
