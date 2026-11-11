import type { Product } from '../types';

export const MAX_CHECK = 5;

/** One editable line in the receipt table. line_total is exactly what was printed unless the user edits it. */
export type ReceiptRow = {
  id: string;
  raw_text: string;
  name: string;
  qty: number;
  line_total: number | null;
  priceText: string; // what's in the price input (lets the user type "3." etc.)
  gender_target: 'female' | 'male' | 'neutral' | 'unknown';
  unreadable: boolean; // true until the user supplies a price
  ticked: boolean;
};

export type ReceiptRead = {
  store: string | null;
  receipt_total: number | null;
  items: {
    raw_text: string;
    name: string;
    qty: number;
    line_total: number | null;
    gender_target: ReceiptRow['gender_target'];
    unreadable: boolean;
  }[];
};

export function toRows(read: ReceiptRead): ReceiptRow[] {
  return read.items.map((it, i) => ({
    id: `r${i}`,
    raw_text: it.raw_text,
    name: it.name,
    qty: it.qty > 0 ? it.qty : 1,
    line_total: it.unreadable ? null : it.line_total,
    priceText: !it.unreadable && it.line_total != null ? it.line_total.toFixed(2) : '',
    gender_target: it.gender_target,
    unreadable: it.unreadable || it.line_total == null,
    // Pre-tick female-targeted lines we could read; the user can change this.
    ticked: it.gender_target === 'female' && !it.unreadable && it.line_total != null,
  }));
}

export function parsePrice(text: string): number | null {
  const n = Number(text.replace(/[£,\s]/g, ''));
  return text.trim() !== '' && Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

/** Product sent to POST /api/compare. Price is the unit price paid, from the receipt. */
export function rowToProduct(row: ReceiptRow): Product {
  return {
    name: row.name.trim(),
    price_gbp: row.line_total != null ? Math.round((row.line_total / row.qty) * 100) / 100 : null,
    source: 'receipt',
    gender_target: row.gender_target,
  };
}
