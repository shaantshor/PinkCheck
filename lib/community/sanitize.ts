// Plain-text sanitiser and limits. React escapes text, and we never use dangerouslySetInnerHTML,
// but we still strip markup-ish characters and control characters before saving anything.

export const LIMITS = {
  title: 120,
  body: 1000,
  comment: 500,
  nickname: 24,
  product: 120,
} as const;

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Strips tags and control characters, collapses odd whitespace, trims, and caps the length. */
export function cleanText(input: unknown, max: number, opts: { multiline?: boolean } = {}): string {
  if (typeof input !== 'string') return '';
  let s = input.replace(CONTROL, '').replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
  s = opts.multiline
    ? s.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n')
    : s.replace(/\s+/g, ' ');
  return s.trim().slice(0, max);
}

/** Returns a clean https URL string, or null. http, javascript:, data: and the rest are rejected. */
export function cleanHttpsUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw || raw.length > 500) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' || !u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Parses a pound amount like "4.99" or "£4.99". Returns null unless it is a sensible positive price. */
export function cleanPrice(input: unknown): number | null {
  if (typeof input === 'number') return Number.isFinite(input) && input > 0 && input < 1000 ? round2(input) : null;
  if (typeof input !== 'string') return null;
  const m = input.replace(/[£\s,]/g, '').match(/^\d+(\.\d{1,2})?$/);
  if (!m) return null;
  const n = Number(m[0]);
  return n > 0 && n < 1000 ? round2(n) : null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** "3 minutes ago" style label. Never throws on bad dates. */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const s = Math.max(0, Math.floor((now - t) / 1000));
  if (s < 45) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${Math.max(1, m)} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`;
  const mo = Math.floor(d / 30);
  return `${mo} month${mo === 1 ? '' : 's'} ago`;
}
