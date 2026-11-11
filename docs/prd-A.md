# PRD, Device A (PM: John)

## Epic A: Search + Comparison Engine
- FR-A1: lib/score.ts computes unit price, gap, score, label, savings per CLAUDE.md formulas.
- FR-A2: Units must match, else "Not enough data".
- FR-A3: POST /api/compare fuzzy-matches demo.json (Fuse threshold 0.4) and skips pairs with null prices.
- FR-A4: Demo-path results have source 'demo', live false, and use the saved explanation.
- FR-A5: Otherwise Claude with web search finds the product and up to 3 equivalents; items without source_url are dropped; live true.
- FR-A6: Web path times out at 25 s and returns "Not enough data" with a friendly message.
- FR-A7: If the input has price_gbp and source photo/receipt, that price is kept as the target price.
- FR-A8: Search page: input, example chips, loading copy, ResultCard, error with next step.
- FR-A9: ResultCard shows big unit prices side by side, label colour, chips, up to 2 extra alternatives in a swipe row, savings badge, explanation, source or "from your photo/receipt" plus date on every price, live badge, "Good news" reverse state, "Not enough data" state.

## Epic S: Scan
- FR-S1: File input with capture=environment, resized to max 1000 px JPEG.
- FR-S2: /api/identify returns a Product (price only if a shelf label is clearly visible) or { error }.
- FR-S3: Editable "We think this is" field, then "Find cheaper alternatives" calls /api/compare.
- FR-S4: Live camera with Capture button; tracks stopped on unmount; permission denied falls back to FR-S1; no continuous analysis.

## Non-functional
Demo path under 1 s; web path up to 25 s with loading state; mobile-first (390 px); HTTPS; every price shows its source; hedged wording; reverse gaps shown honestly; API key server-only.

## Out of scope
Accounts, database, extension, alerts, maps, chat, barcode scanning, anything under Device B's folders.
