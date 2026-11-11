import type { Comparison } from '../types';
import { MAX_CHECK, rowToProduct, type ReceiptRow } from './rows';

export type CheckStatus = 'checking' | 'done' | 'failed';
export type CheckResult = { row: ReceiptRow; status: CheckStatus; comparison: Comparison | null };

const TIMEOUT_MS = 50_000;

async function compareOne(row: ReceiptRow): Promise<Comparison> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: rowToProduct(row) }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`compare ${res.status}`);
    const data = (await res.json()) as Comparison;
    if (!data || typeof data.label !== 'string' || !data.target) throw new Error('bad response');
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Compares up to MAX_CHECK ticked rows in parallel. Scores come only from /api/compare.
 * onUpdate fires whenever any row changes state so the UI can show per-item progress.
 * A failed row never rejects the batch.
 */
export async function compareItems(
  rows: ReceiptRow[],
  onUpdate: (results: CheckResult[]) => void,
): Promise<CheckResult[]> {
  const chosen = rows.filter((r) => r.ticked && r.line_total != null && r.name.trim()).slice(0, MAX_CHECK);
  const results: CheckResult[] = chosen.map((row) => ({ row, status: 'checking', comparison: null }));
  onUpdate([...results]);

  await Promise.allSettled(
    chosen.map(async (row, i) => {
      try {
        const comparison = await compareOne(row);
        results[i] = { row, status: comparison.label === 'Not enough data' ? 'failed' : 'done', comparison };
      } catch {
        results[i] = { row, status: 'failed', comparison: null };
      }
      onUpdate([...results]);
    }),
  );
  return results;
}
