# PinkCheck — Device B PRD (Receipt + Extras)

> Draft written before CLAUDE.md / lib/types.ts were available (the GitHub repo was empty at the time). Type and field names below are **assumed from the brief** and must be verified against `lib/types.ts` after the foundation lands.

## Receipt angle (Analyst — Mary)
- **Why it is our most original feature:** other teams build barcode-scan "Pink Tax" price checkers. A personal audit of *what I actually paid* on a real shop is new — it turns an abstract statistic into "my money, my trip".
- **Who uses it:** women and parents buying for girls who suspect they pay more for gendered products but have never added it up; also journalists/advocates who need a shareable number.
- **The number that lands in the pitch:** "You paid £X in Pink Tax on this trip — about £Z a year."
- **Demo path:** upload the sample receipt → items read → one ticked check → progress rows → summary card → "Call it out" message → Pink Tax Wrapped card.
- **Honesty guardrail:** receipt prices are copied exactly as printed; anything unreadable is shown, never guessed. Wording is hedged ("could have saved", "estimate").

## Epic R — Receipt Pink Tax audit (PM — John)
| ID | Requirement |
|---|---|
| FR-R1 | User can upload or photograph a receipt (`image/*`, camera capture on mobile); HEIC accepted; image resized to max 1500 px before upload. |
| FR-R2 | `POST /api/receipt` returns `{store, items[], receipt_total}`; each item has `raw_text, name, qty, line_total, gender_target, unreadable`. |
| FR-R3 | Prices are copied exactly as printed (GBP). Unreadable lines have `unreadable:true`, `line_total:null`; never guessed. |
| FR-R4 | Abbreviations are expanded to a best-guess product name; `raw_text` is always kept and shown. |
| FR-R5 | Items table is editable (name, qty, price); female-targeted personal-care items are pre-ticked; unreadable rows are highlighted for the user to complete. |
| FR-R6 | If `|sum(items) − receipt_total| > £0.05`, show "Some items may be misread, please check". |
| FR-R7 | "Check for Pink Tax" sends up to 5 ticked items to `POST /api/compare` in parallel, as `Product{name, price_gbp: line_total/qty, source:"receipt", gender_target}`. |
| FR-R8 | Per-item progress rows ("Checking Venus razors… ✓"); a failed item shows "couldn't compare" and does not break totals. |
| FR-R9 | Summary: "You paid £X in Pink Tax on this trip", "You could have saved £Y", "About £Z a year" with editable trips/year (default 12) labelled *estimate*. |
| FR-R10 | Items with gap > 0 listed first; each item's `<ResultCard comparison compact />` collapsed beneath. |
| FR-R11 | When total Pink Tax is 0: honest "No Pink Tax found on this receipt" state. |
| FR-R12 | Pink Tax per item = `(u_target − u_best) × target.quantity × qty` only when gap > 0 and both unit prices are known; otherwise 0. Scores come only from `/api/compare`. |
| FR-R13 | A "Sample receipt" banner is shown whenever `?sample=1` (a sample is in use). |

## Epic X — Extras
| ID | Requirement |
|---|---|
| FR-X1 | `CallItOut`: for High results, a template (no LLM) 2-sentence polite message to the retailer using Comparison data; Copy button and `navigator.share` when available. Rendered under each High item on the receipt results. |
| FR-X2 | `PinkTaxWrapped`: screenshot-friendly pink card ("This trip: £X Pink Tax · About £Z a year · Checked with PinkCheck") with Share (navigator.share text; fallback copy). |

## NFRs
- Never invent prices; every price shows a source ("from your receipt" or a link).
- Show unreadable lines instead of guessing; total-mismatch warning.
- ≤ 5 items compared; parallel calls with visible progress.
- Mobile-first, verified at 390 px.
- Hedged wording ("could", "about", "estimate"); no accusations of the retailer in CallItOut.
- Build (`npm run build`) must pass before every push.

## Out of scope
Bank/loyalty import, saved history, accounts, our own scoring engine.

## Dependencies on Device A (to verify)
`Product`, `Comparison`, `ReceiptItem` (lib/types.ts); `anthropic`, `extractJson` (lib/claude.ts); `fileOrCanvasToJpegBase64` (lib/image.ts); `<ResultCard comparison compact />`; `POST /api/compare` honouring the RECEIPT INTEGRATION RULE (incoming product with `price_gbp` and `source:"receipt"` keeps its paid price as the target).
