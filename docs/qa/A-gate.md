# QA gate 1 (Quinn): A-1 to A-7

| Story | Result | Notes |
|---|---|---|
| A-1 score + tests | PASS | 6 vitest tests: clear gap, equal, reverse, moderate/equivalence, missing data, unit mismatch |
| A-2 ResultCard | PASS (visual check pending) | All states coded; props unchanged; needs a 390 px eyeball once demo.json is filled |
| A-3 demo path | PASS | Verified with temporary test data (reverted): High 90 / £3 saving; receipt price kept; null prices skipped |
| A-4 web path | CONCERNS | Needs ANTHROPIC_API_KEY + web search enabled in the Console; not run live yet |
| A-5 Search | PASS | Chips appear only when demo.json has names |
| A-6 Scan fallback | CONCERNS | Not run with a real photo yet (needs API key) |
| A-7 Live camera | CONCERNS | Not run on a phone yet; permission-denied falls back to file input by design |

CLAUDE.md checklist: no price without a source label (ResultCard shows source/photo/receipt or "source not available"): PASS. Score only from lib/score.ts: PASS. API key not in client code: PASS (grep). Hedged wording and reverse gap: PASS. Build: PASS.
