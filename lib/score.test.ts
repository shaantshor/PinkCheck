import { describe, it, expect } from 'vitest';
import { scoreComparison, unitPrice } from './score';
import type { Product } from './types';

const p = (price: number | null, qty: number | null, unit: Product['unit'] = 'blade'): Product => ({
  name: 'x',
  price_gbp: price,
  quantity: qty,
  unit,
});

describe('score', () => {
  it('clear gap', () => {
    const r = scoreComparison(p(6, 3), p(3, 3), 1); // 2.0 vs 1.0 per blade => gap 1
    expect(r.gap).toBeCloseTo(1);
    expect(r.score).toBe(100);
    expect(r.label).toBe('High');
    expect(r.savings_per_pack).toBeCloseTo(3);
  });
  it('equal prices', () => {
    const r = scoreComparison(p(3, 3), p(3, 3), 0.9);
    expect(r.gap).toBe(0);
    expect(r.score).toBe(0);
    expect(r.label).toBe('No meaningful gap');
    expect(r.savings_per_pack).toBeNull();
  });
  it('reverse gap', () => {
    const r = scoreComparison(p(2, 2), p(4, 2), 1);
    expect(r.gap).toBeLessThan(0);
    expect(r.label).toBe('Reverse gap');
    expect(r.score).toBe(0);
    expect(r.savings_per_pack).toBeNull();
  });
  it('moderate band and equivalence scaling', () => {
    const r = scoreComparison(p(1.25, 1), p(1, 1), 1); // gap 0.25 => 50*1 => High boundary check
    expect(r.score).toBe(50);
    expect(r.label).toBe('High');
    const m = scoreComparison(p(1.2, 1), p(1, 1), 1); // gap .2 => 40
    expect(m.label).toBe('Moderate');
    expect(scoreComparison(p(1.5, 1), p(1, 1), 0.5).score).toBe(50);
  });
  it('missing data', () => {
    expect(scoreComparison(p(null, 3), p(3, 3), 1).label).toBe('Not enough data');
    expect(scoreComparison(p(3, null), p(3, 3), 1).score).toBeNull();
    expect(scoreComparison(p(3, 3), undefined, 1).label).toBe('Not enough data');
    expect(unitPrice(p(3, 0))).toBeNull();
  });
  it('unit mismatch', () => {
    const r = scoreComparison(p(3, 3, 'blade'), p(3, 100, 'ml'), 1);
    expect(r.label).toBe('Not enough data');
    expect(r.score).toBeNull();
  });
});
