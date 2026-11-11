import { describe, expect, it } from 'vitest';
import type { Comparison, Product } from '../types';
import { hasMismatch, itemsSum, pinkTaxForItem, summarise } from './totals';

function cmp(target: Product, best: Product | undefined, gap: number | null): Comparison {
  return {
    target,
    alternatives: best ? [best] : [],
    best,
    equivalence: 1,
    equivalence_reasons: [],
    gap,
    score: null,
    label: 'High',
    savings_per_pack: null,
    explanation: '',
    live: false,
  };
}

const pink: Product = { name: 'Venus 3 pack', price_gbp: 6, quantity: 3, unit: 'blade' };
const blue: Product = { name: 'Gillette 3 pack', price_gbp: 4.5, quantity: 3, unit: 'blade' };

describe('itemsSum / hasMismatch', () => {
  const items = [
    { line_total: 6.0, unreadable: false },
    { line_total: 3.5, unreadable: false },
    { line_total: null, unreadable: true },
  ];
  it('sums readable lines only', () => expect(itemsSum(items)).toBe(9.5));
  it('no mismatch within tolerance', () => expect(hasMismatch(items, 9.52)).toBe(false));
  it('mismatch beyond tolerance', () => expect(hasMismatch(items, 11)).toBe(true));
  it('no mismatch when total unknown', () => expect(hasMismatch(items, null)).toBe(false));
});

describe('pinkTaxForItem', () => {
  it('one gap: (u_target - u_best) * quantity * qty', () => {
    // unit 2.00 vs 1.50 -> 0.50 * 3 = 1.50 per pack
    expect(pinkTaxForItem(cmp(pink, blue, 1 / 3), 1)).toBe(1.5);
    expect(pinkTaxForItem(cmp(pink, blue, 1 / 3), 2)).toBe(3);
  });
  it('reverse gap counts 0', () => {
    expect(pinkTaxForItem(cmp(blue, pink, -0.25), 1)).toBe(0);
  });
  it('missing data counts 0', () => {
    expect(pinkTaxForItem(cmp({ ...pink, price_gbp: null }, blue, null), 1)).toBe(0);
    expect(pinkTaxForItem(cmp(pink, undefined, 0.3), 1)).toBe(0);
    expect(pinkTaxForItem(null, 1)).toBe(0);
  });
});

describe('summarise', () => {
  it('yearly maths and counts; failed items ignored', () => {
    const s = summarise(
      [
        { comparison: cmp(pink, blue, 1 / 3), qty: 1 },
        { comparison: cmp(blue, pink, -0.25), qty: 1 },
        { comparison: null, qty: 1 },
      ],
      12,
    );
    expect(s).toEqual({
      pinkTaxPaid: 1.5,
      couldHaveSaved: 1.5,
      yearlyEstimate: 18,
      itemsChecked: 2,
      itemsWithGap: 1,
    });
  });
  it('zero when nothing found', () => {
    expect(summarise([], 12).pinkTaxPaid).toBe(0);
  });
});
