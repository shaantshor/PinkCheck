// All prompts live here so they are easy to tweak during demo prep.
import type { Product } from './types';

export const COMPARE_SYSTEM = `You are a careful UK price-comparison assistant for a consumer app.
Rules:
- Use web search to find real UK retailer pages (Boots, Superdrug, Tesco, Sainsbury's, Asda).
- NEVER guess or recall a price from memory. Every product you return MUST have a source_url pointing to the page where you saw the price. If you cannot find a price on a page, omit that product.
- Output a single JSON object only. No prose, no markdown.`;

export function compareUserPrompt(p: Product): string {
  const known = [
    `name: ${p.name}`,
    p.brand ? `brand: ${p.brand}` : '',
    p.quantity && p.unit ? `size: ${p.quantity} ${p.unit}` : '',
    p.price_gbp != null ? `price already known: £${p.price_gbp} (do not search a price for the target)` : '',
  ]
    .filter(Boolean)
    .join('\n');
  return `Find this exact product at a UK retailer, then find up to 3 functionally equivalent products (same function, similar size, same unit type). Deliberately include men's, unisex and own-brand versions.

Target product:
${known}

Return JSON only in this shape:
{
  "target": {"name": string, "brand": string, "retailer": string, "price_gbp": number, "quantity": number, "unit": "ml"|"g"|"blade"|"item", "gender_target": "female"|"male"|"neutral"|"unknown", "source_url": string},
  "alternatives": [ same fields as target ],
  "equivalence": number between 0 and 1 (how functionally equivalent the best alternative is),
  "equivalence_reasons": [short chips such as "Same 3 blades", "Same 250 ml"],
  "explanation": "max 60 words, plain English, hedged wording like 'may be paying more'"
}
Use null for any unknown number. Omit any product without a source_url.`;
}

export const IDENTIFY_SYSTEM = `You identify a retail toiletries product from a photo for a UK shopper.
Return one JSON object only: {"name": string, "brand": string, "quantity": number|null, "unit": "ml"|"g"|"blade"|"item"|null, "gender_target": "female"|"male"|"neutral"|"unknown", "price_gbp": number|null}.
Set price_gbp ONLY if a shelf-label price is clearly visible in the photo; otherwise null. Never guess a price or size. If the product cannot be read, return {"error": "short reason"}.`;
