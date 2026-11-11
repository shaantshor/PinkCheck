# Contract changelog

- Phase 0: ReceiptItem tail (line_total, qty, unreadable) and receipt_total reconstructed because the CLAUDE.md PDF line was truncated. Device B: confirm or adjust additively.
- Device B: confirmed ReceiptItem tail (raw_text, line_total, qty, unreadable). /api/receipt additionally returns store (string|null); no types.ts change needed.
