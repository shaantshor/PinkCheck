// FROZEN CONTRACT. Source: CLAUDE.md. Additive optional fields only, logged in docs/CHANGELOG-contract.md.
export type Unit = 'ml' | 'g' | 'blade' | 'item';
export type Gender = 'female' | 'male' | 'neutral' | 'unknown';

export type Product = {
  name: string;
  brand?: string;
  retailer?: string;
  price_gbp?: number | null; // null/undefined = unknown, never guessed
  quantity?: number | null; // e.g. 250 (ml), 8 (blades)
  unit?: Unit;
  gender_target?: Gender;
  source?: 'demo' | 'photo' | 'web' | 'receipt';
  source_url?: string;
  checked_on?: string; // ISO date
};

export type Comparison = {
  target: Product;
  alternatives: Product[]; // cheapest per unit first, max 3
  best?: Product; // alternatives[0] if comparable
  equivalence: number; // 0-1, how functionally equivalent best is
  equivalence_reasons: string[]; // short chips, e.g. "Same 3 blades", "Same 250 ml"
  gap: number | null; // (u_target - u_best) / u_best; negative = reverse gap
  score: number | null; // 0-100 from lib/score.ts
  label: 'No meaningful gap' | 'Moderate' | 'High' | 'Reverse gap' | 'Not enough data';
  savings_per_pack: number | null;
  explanation: string; // max 60 words, plain English
  live: boolean; // true when any price came from web search
};

// POST /api/compare  { product: Product }      -> Comparison
// POST /api/identify { image: string /*base64 jpeg*/ } -> { product: Product } | { error: string }
// POST /api/receipt  { image: string }         -> { items: ReceiptItem[]; receipt_total: number | null }
// NOTE: the tail of the ReceiptItem line was cut off in the CLAUDE.md PDF; fields below are
// reconstructed from the Receipt spec (raw_text, line_total, qty, unreadable). See CHANGELOG-contract.md.
export type ReceiptItem = Product & {
  raw_text: string;
  line_total: number | null;
  qty?: number;
  unreadable?: boolean;
};
