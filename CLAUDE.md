# PinkCheck: CLAUDE.md

Transcribed from the team's CLAUDE.md PDF (docs/CLAUDE-source.pdf is the original; where it was cut off at the page edge, see docs/CHANGELOG-contract.md).

Hackathon project. Theme: women's everyday challenges, the "Pink Tax". About 1 hour build, then a strict 2-minute pitch. Judging: originality, live demo delivery, UI/UX, real-world impact, relevance to theme. Ship a working demo over more features; cut what isn't working by its checkpoint.

## What we're building
Mobile-first web app that helps shoppers spot when they may be paying more for a product just because it's marketed to women, and shows a cheaper equivalent. Three ways in, one shared engine:
- Search (Person 1): type a product, get a Pink Tax Score, alternatives, savings
- Scan (Person 2): live rear camera, Capture, AI reads product, same result card titled "Cheaper alternatives"
- Receipt (Person 3): upload receipt photo, AI reads line items, user can fix, app totals "Pink Tax paid" and "You could have saved"
- Person 4 owns data/demo.json (real, hand-checked prices) and the pitch.

## Non-negotiable rules
1. Never invent prices, sizes or products. Prices only from (a) data/demo.json, (b) the user's own photo (shelf label or receipt), (c) a Claude web search result with a source URL. Otherwise show "price not found". Never fill a price from model memory.
2. The score is computed in code (lib/score.ts), never by the LLM. The LLM only identifies products, finds candidates (with sources) and writes explanation text.
3. Only Person 1 edits lib/score.ts, lib/types.ts and app/api/compare. Scan and Receipt call /api/compare; they never compute their own scores.
4. The Anthropic API key stays on the server (process.env.ANTHROPIC_API_KEY). Never import the SDK in client components.
5. Hedged, fair wording: "may be paying more", not "is ripping you off". Show reverse gaps honestly ("Good news: the women's version is cheaper here").
6. Every result shows its price source (a link, or "from your photo") and date checked. Web-search results get a "Live estimate, check source" badge.

## Background (for copy)
- 2015 NYC Dept of Consumer Affairs: women's personal care costs about 13% more than men's.
- Moshary, Tuchman & Bhatia (Marketing Science, 2023): comparing similar ingredients, no systematic premium; most gaps come from product differences and pack sizes. PinkCheck's value is per-unit comparison of functionally equivalent products.
- UK: gender-based pricing of goods isn't illegal. #sexistsurcharge pressure has made Boots and Tesco change prices. Unit pricing on cosmetics mandatory under Price Marking Order reforms from April 2026.
- US: New York (2020) and California (2023, AB 1287) ban gender-based pricing of substantially similar goods.

## Tech stack
Next.js App Router + TypeScript + Tailwind, Vercel (HTTPS needed for camera). @anthropic-ai/sdk, model `claude-sonnet-5-5` for everything. Web search tool: `{ type: "web_search_20250305", name: "web_search", max_uses: 3 }`. zod validates every LLM JSON. fuse.js fuzzy-matches demo.json. No database, no auth.

## File structure
app/layout.tsx (tab bar Search | Scan | Receipt), page.tsx (Search), scan/page.tsx, receipt/page.tsx, api/compare/route.ts, api/identify/route.ts, api/receipt/route.ts; components/ResultCard.tsx, ScoreGauge.tsx, Loading.tsx; lib/types.ts, score.ts, claude.ts, image.ts, prompts.ts; data/demo.json.

## Shared contract: lib/types.ts (frozen, see the file)

## Scoring (lib/score.ts)
```
unit_price = price_gbp / quantity           (needs both; else null)
gap        = (u_target - u_best) / u_best
score      = round(100 * min(1, max(0, gap) / 0.5) * equivalence)
savings_per_pack = (u_target - u_best) * target.quantity   (only if gap > 0)
label: gap < 0 -> "Reverse gap"; score < 20 -> "No meaningful gap"; < 50 -> "Moderate"; else "High"
missing prices/quantities -> "Not enough data", score null
```
Only compare matching units. If units differ, "Not enough data". Tests: clear gap, equal prices, reverse gap, missing data.

## /api/compare flow
1. Fuse.js match product.name against demo.json (threshold ~0.4). If matched and prices filled, build Comparison from the demo pair (source 'demo', live false), use saved explanation if present. Instant.
2. Otherwise Claude + web search: find exact product at a UK retailer (Boots, Superdrug, Tesco, Sainsbury's, Asda) and up to 3 functionally equivalent products (same function, similar size, same unit), including men's, unisex, own-brand. JSON only: name, brand, retailer, price_gbp, quantity, unit, gender_target, source_url each, plus equivalence 0-1, equivalence_reasons, explanation. Never guess a price; omit any product without a source URL.
3. Validate with zod, drop items without source_url, compute in lib/score.ts, live: true.
4. 25 s timeout then label 'Not enough data' with a friendly message.
5. In-memory Map cache keyed by lowercase name.

ResultCard: score gauge with label and colour; target vs best side by side (price, size, big unit price, retailer, source link); equivalence_reasons as chips; up to 2 more alternatives in a horizontal swipe row; savings badge; explanation; "Call it out" button (extras).

## Scan
Build order: (1) `<input type="file" accept="image/*" capture="environment">` fallback; (2) getUserMedia({ video: { facingMode: 'environment' }, audio: false }) into `<video playsInline muted autoPlay>` with a big Capture button drawing to a canvas. Resize max 1000 px, JPEG 0.8, base64 (lib/image.ts). /api/identify returns { name, brand, quantity, unit, gender_target, price_gbp }; price_gbp only if a shelf label price is clearly visible (source 'photo'), else null; unreadable -> { error }. Show "We think this is: ..." editable field and "Find cheaper alternatives" button, POST /api/compare, render ResultCard. Never analyse every video frame. Barcode scanning is stretch only.

## Receipt
Max 1500 px upload to /api/receipt; Claude reads line items (copy prices exactly, keep raw_text, expand abbreviations to best-guess name, unreadable: true instead of guessing, classify gender_target). In code: if line totals don't sum to receipt_total within £0.05 show "Some items may be misread, please check". Editable table, female-targeted personal-care items pre-ticked. "Check for Pink Tax" sends up to 5 items to /api/compare via Promise.all with progress. Summary computed in code: Pink Tax paid = sum over gap > 0 of (u_target - u_best) * quantity * qty; You could have saved; Yearly estimate = total x trips (default 12, labelled estimate). Sample receipt must say "Sample receipt" (?sample=1 banner).

## Demo data
data/demo.json: empty placeholders only, never fill in prices or names (Person 4 does). About 8 pairs (razors, deodorant, shaving gel, body wash/shampoo), at least 1 strong Pink Tax case and 1 reverse gap. price_gbp: null means "not found", never crash.

## Extras (only after core works): Call it out; Pink Tax Wrapped; Fair verdict highlight. Do not build: accounts, database, extension, alerts, maps, chat.

## UI/UX
Mobile-first, large tap targets, bottom tab bar always visible. Soft pink accent, lots of white, dark grey text. Score colours: green (no gap/reverse), amber (moderate), pink-red (high). Lead with unit price, big numbers, short words. Loading text: "Reading your receipt...", "Finding cheaper equivalents..." (web search 10-20 s). Every error offers a next step.

## Commands
npm install; npm run dev; npm run build (must pass before every merge); vercel --prod (set ANTHROPIC_API_KEY).

## Git
Branches feat/search-engine, feat/scan, feat/receipt; Person 1 merges to main. Keep features in their own folders. Only Person 1 touches layout.tsx, lib/types.ts, lib/score.ts, components/ResultCard.tsx.

## Implementation notes
- extractJson in lib/claude.ts: last text block, strip fences, first "{" to last "}", JSON.parse, zod. On failure retry once with "Return valid JSON only."
- Web search responses have several blocks; read the final text block(s).
- Images: `{ type: "image", source: { type: "base64", media_type: "image/jpeg", data } }`. JPEG/PNG/GIF/WebP only; HEIC must be converted via canvas.
- `export const maxDuration = 60` on routes using web search.
- Prompts in lib/prompts.ts.

## Definition of done
Deployed URL works on phone over HTTPS; Search hook product instant from demo.json with High score and source link; reverse-gap product shows "Good news"; Scan Capture returns a result card; Receipt demo produces items and totals; no price without a source label; npm run build passes; 60 s backup screen recording exists.
