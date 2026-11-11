# QA gate — Device B (Quinn)

Method: vitest (15 tests incl. 9 for totals), `npm run build`, eslint on Device B folders, a browser run at 390 px with `/api/receipt` and `/api/compare` stubbed in the page, then an unstubbed run of the sample receipt against the real `/api/compare` on the merged main. **Live vision reading (`/api/receipt`) was NOT tested against a real receipt photo (no ANTHROPIC_API_KEY here).**

| Story | Result | Notes |
|---|---|---|
| B-1 totals | PASS | gap, reverse gap, missing data, mismatch true/false, yearly maths covered. |
| B-2 /api/receipt | CONCERNS | Builds; zod + retry + 422 implemented. Not exercised against the real model. Needs a real run once a key exists. |
| B-3 upload UI | PASS (stubbed) | Reading state, preview, error copy "Try a flatter, brighter photo". Not tried with a real HEIC or blurry photo. |
| B-4 items table | PASS | Female items pre-ticked, unreadable row highlighted and unticked until priced, mismatch banner shows (£9.50 vs £20.00), "Sample receipt" banner, max 5 ticks. Mismatch clearing after an edit not clicked through in the browser. |
| B-5 compare | PASS | Parallel allSettled; a forced 500 on one item showed "couldn't compare" and was excluded from totals (stubbed). Per-item progress rows rendered. |
| B-6 summary | PASS | Real engine on the sample: "You paid £3.24 in Pink Tax on this trip", about £38.88 a year (estimate, trips editable, default 12), collapsed ResultCards. Zero state "No Pink Tax found" built but not viewed. |
| B-7 extras | PASS | CallItOut shows only on High, 2-sentence template from Comparison data, Copy; Share only when navigator.share exists. Wrapped card rendered and hidden at £0. Wrapped not reviewed as an actual screenshot. |

Sample path (no API key needed): `/receipt?sample=1` or the "Try a sample receipt" button loads a list built from data/demo.json (real Superdrug names and prices). Verified against the real /api/compare: £3.24 Pink Tax (Venus Smooth Sensitive 3 pack £4.99 vs Gillette Blue3 x12 £6.99), 3 other items correctly "no gap".

Cross-cutting checks
- No price without a source: receipt rows say "from your receipt"; ResultCard handles the rest. PASS.
- No score computed outside /api/compare: totals only use `gap` and unit prices from the Comparison. PASS.
- Unreadable lines never guessed: schema forces `line_total:null` when unreadable/missing. PASS.
- Build: PASS. Lint on Device B folders: clean. 390 px: no horizontal overflow.

Known issues
1. The sticky "Check for Pink Tax" bar slightly overlaps the last row; scrollable, not blocking.
2. Dark-mode body colour in globals.css was fixed by Device A (0bd03fe); the receipt page keeps its own white background as a harmless safeguard.
