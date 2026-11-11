import { NextResponse } from 'next/server';
import type { Comparison, Product } from '@/lib/types';

export const maxDuration = 60;

// MOCK: placeholder until story A-3/A-4. Returns "Not enough data" so no fake prices appear.
export async function POST(req: Request) {
  const { product } = (await req.json()) as { product: Product };
  const comparison: Comparison = {
    target: product,
    alternatives: [],
    equivalence: 0,
    equivalence_reasons: [],
    gap: null,
    score: null,
    label: 'Not enough data',
    savings_per_pack: null,
    explanation: 'Comparison engine is still being built. Try again shortly.',
    live: false,
  };
  return NextResponse.json(comparison);
}
