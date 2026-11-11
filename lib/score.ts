import type { Comparison, Product } from './types';

export type Scored = Pick<Comparison, 'gap' | 'score' | 'label' | 'savings_per_pack'>;

export function unitPrice(p: Product): number | null {
  if (p.price_gbp == null || p.quantity == null || p.quantity <= 0) return null;
  return p.price_gbp / p.quantity;
}

/** The only place scores are computed. equivalence is 0-1. */
export function scoreComparison(target: Product, best: Product | undefined, equivalence: number): Scored {
  const none: Scored = { gap: null, score: null, label: 'Not enough data', savings_per_pack: null };
  if (!best) return none;
  if (!target.unit || !best.unit || target.unit !== best.unit) return none;
  const ut = unitPrice(target);
  const ub = unitPrice(best);
  if (ut === null || ub === null || ub === 0) return none;

  const gap = (ut - ub) / ub;
  const eq = Math.min(1, Math.max(0, equivalence));
  const score = Math.round(100 * Math.min(1, Math.max(0, gap) / 0.5) * eq);
  const label: Scored['label'] =
    gap < 0 ? 'Reverse gap' : score < 20 ? 'No meaningful gap' : score < 50 ? 'Moderate' : 'High';
  const savings_per_pack = gap > 0 ? (ut - ub) * (target.quantity as number) : null;
  return { gap, score, label, savings_per_pack };
}
