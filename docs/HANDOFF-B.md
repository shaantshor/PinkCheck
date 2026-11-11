# Handoff to Device B

You are Device B. Build the Receipt tab and the extras. Device A has finished Search, Scan and the comparison engine and is low on tokens, so you now own everything below. Read CLAUDE.md first (binding), then docs/architecture.md.

## Setup
```
git clone https://github.com/shaantshor/PinkCheck.git && cd PinkCheck
npm install
cp .env.example .env.local   # put ANTHROPIC_API_KEY in it (server only, never commit)
npm run dev                  # http://localhost:3000
```
Next.js here is v16. Read node_modules/next/dist/docs/ if something behaves oddly.

## What already works (do not rebuild)
- POST /api/compare { product: Product } -> Comparison. Demo set first (data/demo.json, 5 real Superdrug pairs), then Claude web search if a key exists.
- components/ResultCard.tsx, props `{ comparison: Comparison; compact?: boolean }`. Import it, do not edit it.
- lib/image.ts `fileOrCanvasToJpegBase64(file, maxEdge)`, lib/claude.ts (`anthropic`, `extractJson`, `MODEL`), lib/types.ts (frozen), lib/score.ts (never compute your own score).
- Receipt rule already inside /api/compare: if a product has price_gbp and source "receipt", that price is kept as the target price. Send quantity/unit if you know them, otherwise the engine fills them from the demo match.

## Your files (only touch these)
app/receipt/**, app/api/receipt/**, components/receipt/**, components/extras/**, lib/receipt/**, docs/stories/B-*.md, docs/prd-B.md, docs/qa/B-gate.md.
Do NOT edit A's files (layout, page.tsx, scan, compare, ResultCard, score, types, demo.json). Need a change there? Write it under "Requests to Device A" at the bottom of docs/architecture.md and carry on.

## Tasks, in order (cut from the bottom if short of time)
1. **POST /api/receipt** { image: base64 jpeg } -> { items: ReceiptItem[]; receipt_total: number | null }. Claude vision, prompt in lib/receipt/prompts.ts. Rules: copy prices exactly as printed, keep raw_text, expand abbreviations to a best-guess name ("GIL VNS WMN RZR 3PK" -> "Gillette Venus women's razor 3 pack"), set unreadable: true instead of guessing, classify gender_target from the name. Validate with zod via extractJson, retry once with "Return valid JSON only." Set source "receipt" on items.
2. **Receipt page** (app/receipt/page.tsx, replace the placeholder): file input (accept image/*, capture environment), resize max 1500 px, loading text "Reading your receipt...", editable table (name, qty, price), female-targeted personal-care items pre-ticked. In code, if line totals do not sum to receipt_total within 0.05, show "Some items may be misread, please check".
3. **Check for Pink Tax** button: send up to 5 ticked items to POST /api/compare with Promise.all and a per-item progress indicator. Each item: `{ name, price_gbp, quantity, unit, gender_target, source: "receipt" }`.
4. **Summary card, computed in code**: Pink Tax paid = sum over items where gap > 0 of `savings_per_pack * qty`; You could have saved = same in pounds shown as a total; Yearly estimate = total x trips per year (editable, default 12, labelled "estimate"). Each item's ResultCard sits collapsed below.
5. **Sample receipt (must work with no API key)**: `/receipt?sample=1` or a "Try a sample receipt" button loads a hard-coded item list, with a visible "Sample receipt" banner. Build the sample ONLY from products in data/demo.json using their real names and prices (e.g. the Venus Smooth Sensitive 3 pack at 4.99), so no price is invented. This is the pitch-safe path.
6. **Extras**: components/extras/CallItOut.tsx, props `{ comparison: Comparison }`, shown on High results: drafts a polite factual message ("Your women's X costs £a per razor vs £b for the men's Y...") with copy to clipboard, hedged wording. Device A or the humans will render it under High results on Search and Scan. Then a shareable "Pink Tax Wrapped" card after a receipt check ("This trip: £X Pink Tax, about £Y a year").

## Rules that always apply
No invented prices. Score only from lib/score.ts. API key server-only. Hedged wording ("may be paying more"). Every price shows its source. Mobile-first at 390 px, light theme, soft pink accent. Every error offers a next step.

## Git
`git pull --rebase` before every push, push straight to main (only your own folders, so no conflicts). `npm run build` must pass before each push. Print `B-<n> DONE | build ok | pushed` after each task. If ReceiptItem or the receipt response need extra fields, add optional ones only and note them in docs/CHANGELOG-contract.md.

## Context
- The contract's ReceiptItem tail was reconstructed (line_total, qty?, unreadable?) because the original PDF was cut off. Confirm it fits.
- Web search and Scan photo reading need the API key. The demo path does not.
- Pitch is a strict 2 minutes on a phone or narrow window; prefer a working sample over more features.
