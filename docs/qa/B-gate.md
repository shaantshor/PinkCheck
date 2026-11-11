# QA gate ??Device B (Quinn)

Method: vitest (15 tests incl. 9 for totals), `npm run build`, eslint on Device B folders, and a browser run at 390 px with `/api/receipt` and `/api/compare` stubbed in the page (no ANTHROPIC_API_KEY and no sample receipt image were available). **Live vision reading was NOT tested against a real receipt photo.**

| Story | Result | Notes |
|---|---|---|
| B-1 totals | PASS | gap, reverse gap, missing data, mismatch true/false, yearly maths covered. |
| B-2 /api/receipt | CONCERNS | Builds; zod + retry + 422 implemented. Not exercised against the real model. Needs a real run once a key + sample image exist. |
| B-3 upload UI | PASS (stubbed) | Reading state, preview, error copy "Try a flatter, brighter photo". Not tried with a real HEIC or blurry photo. |
| B-4 items table | PASS | Female items pre-ticked, unreadable row highlighted and unticked until priced, mismatch banner shows (짙9.50 vs 짙20.00), "Sample receipt" banner on `?sample=1`, max 5 ticks. Mismatch clearing after edit not clicked through in the browser. |
| B-5 compare | PASS (stubbed) | Parallel allSettled; a forced 500 on one item showed as "couldn't compare" and was excluded from totals. Per-item progress rows rendered. |
| B-6 summary | PASS (stubbed) | "You paid 짙1.50 in Pink Tax", could have saved 짙1.50, About 짙18.00 a year (estimate, trips editable, default 12), collapsed ResultCard. Zero state "No Pink Tax found" built but not viewed. |
| B-7 extras | PASS (stubbed) | CallItOut shows only on High, 2-sentence template from Comparison data, Copy; Share only when navigator.share exists. Wrapped card hidden at 짙0. Wrapped screenshot not reviewed visually. |

Cross-cutting checks
- No price without a source: receipt rows say "from your receipt"; ResultCard handles the rest. PASS.
- No score computed outside /api/compare: totals only use `gap` and unit prices from the Comparison. PASS.
- Unreadable lines never guessed: schema forces `line_total:null` when unreadable/missing. PASS.
- Build: PASS. Lint on Device B folders: clean.

Known issues
1. `globals.css` (Device A) forces a near-black body in dark mode; receipt page wraps itself in white. Logged under "Requests to Device A".
2. Sample path (no API key needed): `/receipt?sample=1` or the "Try a sample receipt" button loads a list built from data/demo.json (real Superdrug names and prices). Verified end to end against the real /api/compare on the merged main: £3.24 Pink Tax (Venus Smooth Sensitive 3 pack £4.99 vs Gillette Blue3 x12 £6.99), about £38.88 a year at 12 trips, Call it out shown for the High item, 3 other items correctly 'no gap'.
3. Sticky "Check for Pink Tax" bar slightly overlaps the last row; scrollable, not blocking.
