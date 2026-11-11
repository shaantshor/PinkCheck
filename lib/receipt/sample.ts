// Pitch-safe sample receipt. Built ONLY from products in data/demo.json (real names and prices,
// hand-checked by the humans), so no price is invented. Works with no API key.
import demo from '../../data/demo.json';
import type { ReceiptRead } from './rows';

type DemoProduct = { name: string; price_gbp: number | null; gender_target: string | null };
type DemoPair = { pair_id: string; products: DemoProduct[] };

// Women's-marketed product (products[0]) from each pair, in "till order".
const PAIR_IDS = ['razor-1', 'shaving-gel-1', 'razor-2', 'deodorant-1'];

export function sampleReceipt(): ReceiptRead {
  const pairs = demo as unknown as DemoPair[];
  const items = PAIR_IDS.flatMap((id) => {
    const p = pairs.find((x) => x.pair_id === id)?.products[0];
    if (!p || !p.name || p.price_gbp == null) return [];
    return [
      {
        raw_text: p.name,
        name: p.name,
        qty: 1,
        line_total: p.price_gbp,
        gender_target: 'female' as const,
        unreadable: false,
      },
    ];
  });
  const total = Math.round(items.reduce((s, i) => s + (i.line_total ?? 0), 0) * 100) / 100;
  return { store: 'Superdrug (sample)', receipt_total: total, items };
}
