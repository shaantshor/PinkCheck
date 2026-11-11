import Fuse from 'fuse.js';
import { z } from 'zod';
import demoRaw from '@/data/demo.json';
import type { Comparison, Product } from './types';
import { scoreComparison, unitPrice } from './score';

type DemoPair = {
  pair_id: string;
  category: string;
  products: Product[];
  equivalence: number;
  equivalence_reasons: string[];
  explanation: string;
};

const pairs = demoRaw as unknown as DemoPair[];

const usable = (p: Product) => !!p.name && p.price_gbp != null && p.quantity != null && !!p.unit;
const clean = (p: Product): Product => {
  const out: Product = { ...p, source: 'demo' };
  (Object.keys(out) as (keyof Product)[]).forEach((k) => {
    if (out[k] === '' || out[k] === null) delete out[k];
  });
  // price/quantity null must stay meaningful only when present
  return { ...out, price_gbp: p.price_gbp ?? null, quantity: p.quantity ?? null };
};

export const notEnoughData = (target: Product, message: string, live = false): Comparison => ({
  target,
  alternatives: [],
  equivalence: 0,
  equivalence_reasons: [],
  gap: null,
  score: null,
  label: 'Not enough data',
  savings_per_pack: null,
  explanation: message,
  live,
});

function build(
  target: Product,
  alternatives: Product[],
  equivalence: number,
  reasons: string[],
  explanation: string,
  live: boolean,
): Comparison {
  const ranked = alternatives
    .filter((a) => unitPrice(a) !== null && a.unit === target.unit)
    .sort((a, b) => (unitPrice(a) as number) - (unitPrice(b) as number))
    .slice(0, 3);
  const best = ranked[0];
  const s = scoreComparison(target, best, equivalence);
  const fallback =
    s.label === 'Reverse gap'
      ? 'Good news: this version is cheaper per unit than the alternative we compared.'
      : s.label === 'Not enough data'
        ? 'We could not find enough verified data for a fair comparison.'
        : `You may be paying more per unit than for a similar product. Check the sources before deciding.`;
  return {
    target,
    alternatives: ranked,
    best,
    equivalence,
    equivalence_reasons: reasons,
    ...s,
    explanation: explanation || fallback,
    live,
  };
}

const usablePairs = pairs.filter((p) => p.products.filter(usable).length >= 2);
const flat = usablePairs.flatMap((pair) =>
  pair.products.filter(usable).map((product) => ({ pair, product })),
);
const fuse = new Fuse(flat, {
  keys: ['product.name', 'product.brand'],
  threshold: 0.4,
  includeScore: true,
});

export function demoCompare(input: Product): Comparison | null {
  const hit = fuse.search(input.name)[0];
  if (!hit) return null;
  const { pair, product: matched } = hit.item;
  const good = pair.products.filter(usable).map(clean);
  const matchedClean = good.find((g) => g.name === matched.name) ?? clean(matched);
  const others = good.filter((g) => g.name !== matched.name);

  // RECEIPT INTEGRATION RULE: user actually paid this price; keep it.
  const userPaid = input.price_gbp != null && (input.source === 'photo' || input.source === 'receipt');
  let target: Product;
  let alternatives: Product[];
  if (userPaid) {
    target = {
      ...input,
      quantity: input.quantity ?? matchedClean.quantity,
      unit: input.unit ?? matchedClean.unit,
      gender_target: input.gender_target ?? matchedClean.gender_target,
    };
    alternatives = others;
  } else {
    // Show the pair from the women's-marketed side so the gap reads correctly whichever was typed.
    const female = good.find((g) => g.gender_target === 'female') ?? good[0];
    target = female;
    alternatives = good.filter((g) => g.name !== female.name);
  }
  return build(target, alternatives, pair.equivalence, pair.equivalence_reasons, pair.explanation, false);
}

// ---- web path ----
const nn = <T extends z.ZodTypeAny>(s: T) => s.nullish();
const ProductZ = z.object({
  name: z.string(),
  brand: nn(z.string()),
  retailer: nn(z.string()),
  price_gbp: nn(z.number()),
  quantity: nn(z.number()),
  unit: nn(z.enum(['ml', 'g', 'blade', 'item'])),
  gender_target: nn(z.enum(['female', 'male', 'neutral', 'unknown'])),
  source_url: nn(z.string()),
});
export const WebZ = z.object({
  target: ProductZ,
  alternatives: z.array(ProductZ).default([]),
  equivalence: z.number().min(0).max(1).default(0.8),
  equivalence_reasons: z.array(z.string()).default([]),
  explanation: z.string().default(''),
});

const toProduct = (p: z.infer<typeof ProductZ>, today: string): Product => ({
  name: p.name,
  brand: p.brand ?? undefined,
  retailer: p.retailer ?? undefined,
  price_gbp: p.price_gbp ?? null,
  quantity: p.quantity ?? null,
  unit: p.unit ?? undefined,
  gender_target: p.gender_target ?? undefined,
  source: 'web',
  source_url: p.source_url ?? undefined,
  checked_on: today,
});

export function fromWeb(input: Product, web: z.infer<typeof WebZ>): Comparison {
  const today = new Date().toISOString().slice(0, 10);
  const userPaid = input.price_gbp != null && (input.source === 'photo' || input.source === 'receipt');
  const wt = toProduct(web.target, today);
  let target: Product;
  if (userPaid) {
    target = { ...input, quantity: input.quantity ?? wt.quantity, unit: input.unit ?? wt.unit };
  } else {
    // no price without a source URL
    target = wt.source_url ? wt : { ...wt, price_gbp: null };
  }
  const alts = web.alternatives.map((a) => toProduct(a, today)).filter((a) => a.source_url);
  return build(target, alts, web.equivalence, web.equivalence_reasons, web.explanation, true);
}
