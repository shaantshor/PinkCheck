// Pure receipt maths. No AI, no scoring: unit prices come from the Comparison's own products
// (via lib/score.unitPrice) and the Pink Tax figure is derived only from the engine's gap.
import type { Comparison, ReceiptItem } from '../types';
import { unitPrice } from '../score';

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Sum of readable line totals. Unreadable / null lines count 0. */
export function itemsSum(items: Pick<ReceiptItem, 'line_total' | 'unreadable'>[]): number {
  return round2(
    items.reduce((sum, it) => (it.unreadable || it.line_total == null ? sum : sum + it.line_total), 0),
  );
}

/** True when the printed total and the sum of line items disagree by more than `tolerance` (£). */
export function hasMismatch(
  items: Pick<ReceiptItem, 'line_total' | 'unreadable'>[],
  receiptTotal: number | null | undefined,
  tolerance = 0.05,
): boolean {
  if (receiptTotal == null || Number.isNaN(receiptTotal)) return false;
  return Math.abs(itemsSum(items) - receiptTotal) > tolerance + 1e-9;
}

/**
 * Pink Tax paid for one receipt line: (u_target - u_best) * target.quantity * qty.
 * Only when the engine found a gap > 0 and both unit prices are known; otherwise 0.
 */
export function pinkTaxForItem(comparison: Comparison | null | undefined, qty = 1): number {
  if (!comparison || comparison.gap == null || comparison.gap <= 0) return 0;
  const { target, best } = comparison;
  if (!best) return 0;
  const ut = unitPrice(target);
  const ub = unitPrice(best);
  if (ut === null || ub === null || target.quantity == null) return 0;
  const diff = ut - ub;
  if (diff <= 0) return 0;
  const q = Number.isFinite(qty) && qty > 0 ? qty : 1;
  return round2(diff * target.quantity * q);
}

export type ItemResult = { comparison: Comparison | null; qty?: number };

export type Summary = {
  pinkTaxPaid: number;
  couldHaveSaved: number;
  yearlyEstimate: number;
  itemsChecked: number;
  itemsWithGap: number;
};

/** Totals across all successfully compared items. Failed items (comparison null) are ignored. */
export function summarise(results: ItemResult[], tripsPerYear: number): Summary {
  const trips = Number.isFinite(tripsPerYear) && tripsPerYear > 0 ? tripsPerYear : 0;
  let pinkTaxPaid = 0;
  let itemsChecked = 0;
  let itemsWithGap = 0;
  for (const r of results) {
    if (!r.comparison) continue;
    itemsChecked += 1;
    const tax = pinkTaxForItem(r.comparison, r.qty ?? 1);
    if (tax > 0) itemsWithGap += 1;
    pinkTaxPaid += tax;
  }
  pinkTaxPaid = round2(pinkTaxPaid);
  return {
    pinkTaxPaid,
    // v1: same quantity at the best equivalent's unit price, so the saving equals the premium paid.
    couldHaveSaved: pinkTaxPaid,
    yearlyEstimate: round2(pinkTaxPaid * trips),
    itemsChecked,
    itemsWithGap,
  };
}
