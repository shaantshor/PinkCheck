# Brief (Analyst: Mary)

**Problem.** Women's personal care can cost more than men's (NYC 2015: about 13%). A 2023 Marketing Science study (Moshary, Tuchman, Bhatia) found most gaps come from product and pack-size differences, so the useful tool is a per-unit comparison of functionally equivalent products. UK gender pricing is legal, so shoppers must spot it themselves.

**User.** A UK shopper in the toiletries aisle or checking a receipt, on a phone.

**Judging fit.**
- Originality: three ways in (type, scan, receipt), one engine; "why this swap" chips.
- Live demo: demo-set path is instant; scan is capture-and-go.
- UI/UX: big unit prices, colour-coded label, mobile-first.
- Impact: real savings in £, source on every price, reverse gaps shown honestly.
- Theme: Pink Tax, hedged wording ("may be paying more").

**Constraints.** About 55 min. No invented prices: only demo.json, the user's photo or receipt, or web search with a source URL.

**Top risks.**
1. Web search slow or fails: 25 s timeout, friendly "Not enough data", demo set is the demo path.
2. demo.json stays empty: example chips hidden until filled; Search still works via web path.
3. Camera permission or HEIC issues: file-input fallback first, canvas JPEG conversion.
