# Architecture (Architect: Winston)

## File ownership
| Path | Owner |
|---|---|
| package.json, config, app/layout.tsx, globals.css, components/TabBar.tsx | A |
| lib/types.ts (frozen), score.ts, claude.ts, image.ts, prompts.ts | A |
| app/api/compare/**, app/api/identify/** | A |
| app/page.tsx, app/scan/page.tsx | A |
| components/ResultCard.tsx, ScoreGauge.tsx, Loading.tsx | A |
| data/demo.json (humans fill), docs/brief, prd-A, architecture, stories/A-*, qa/A-gate | A |
| app/receipt/**, app/api/receipt/**, components/receipt/**, components/extras/**, lib/receipt/**, docs/stories/B-*, prd-B, qa/B-gate | B |

## Contract
lib/types.ts is frozen. Additive optional fields only, logged in docs/CHANGELOG-contract.md.

## Data flow
input (typed / identified / receipt line) -> POST /api/compare -> demo match or web search -> lib/score.ts -> Comparison -> ResultCard.

## Engine algorithm
1. If product has price_gbp and source is photo or receipt: keep it as the target price (RECEIPT INTEGRATION RULE). Use demo/web only to fill missing quantity/unit and to find alternatives.
2. Fuse match on demo.json product names (threshold 0.4). Skip pairs with null prices. Build target and alternatives from the pair; compute with score.ts.
3. Else web path: Claude `claude-sonnet-5-5` with web_search tool (max_uses 3), prompt in lib/prompts.ts, read final text block, extractJson + zod, drop items without source_url, retry once on invalid JSON.
4. Rank alternatives by unit price (matching unit only), max 3, best = first. Score from score.ts only.
5. Cache in a Map keyed by lowercase name (not for receipt/photo-priced inputs).

## Errors and timeouts
Web path 25 s abort -> label "Not enough data" with friendly explanation. Invalid JSON retried once. Missing key -> same friendly state. Routes return 200 with a Comparison so the UI never crashes.

## Env and prompts
ANTHROPIC_API_KEY (server only; set in Vercel). Prompts in lib/prompts.ts. `maxDuration = 60` on web-search routes.

## Receipt integration rule
Implemented in /api/compare per step 1 above.

## Requests to Device B
- Import `components/ResultCard` (props `{ comparison, compact? }`, unchanged). Call POST /api/compare with `source: 'receipt'` products.
- Please confirm the reconstructed ReceiptItem tail in CHANGELOG-contract.md.
- Put CallItOut in components/extras/CallItOut.tsx (A renders it under High results in A-8). Done: A renders it on Search and Scan.
- Receipt summary: items with a reverse gap (the women's version is cheaper) are labelled "no gap". Please show "cheaper than the alternative" instead, so reverse gaps are shown honestly.

## Requests to Device A
- (resolved by A in 0bd03fe) globals.css dark mode.
- (resolved by A) Community tab added to the tab bar; CallItOut rendered under High results on Search and Scan.
- Receipt page: sample receipt is built from data/demo.json in lib/receipt/sample.ts (no image needed).
