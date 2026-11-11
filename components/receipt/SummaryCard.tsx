'use client';

import ResultCard from '@/components/ResultCard';
import CallItOut from '@/components/extras/CallItOut';
import type { CheckResult } from '@/lib/receipt/compareClient';
import { pinkTaxForItem, summarise } from '@/lib/receipt/totals';

type Props = { results: CheckResult[]; tripsPerYear: number; onTripsChange: (n: number) => void };

const gbp = (n: number) => `£${n.toFixed(2)}`;

export default function SummaryCard({ results, tripsPerYear, onTripsChange }: Props) {
  const ok = results.filter((r) => r.status === 'done' && r.comparison);
  const failed = results.filter((r) => !(r.status === 'done' && r.comparison));
  const s = summarise(
    ok.map((r) => ({ comparison: r.comparison, qty: r.row.qty })),
    tripsPerYear,
  );
  // Items with a gap first (biggest first), then the rest in receipt order.
  const ranked = ok
    .map((r) => ({ r, tax: pinkTaxForItem(r.comparison, r.row.qty) }))
    .sort((a, b) => b.tax - a.tax);

  return (
    <section aria-label="Pink Tax summary" className="space-y-4">
      {s.pinkTaxPaid > 0 ? (
        <div className="rounded-2xl bg-pink-50 p-5">
          <h2 className="text-2xl font-extrabold leading-tight text-pink-700">
            You paid {gbp(s.pinkTaxPaid)} in Pink Tax on this trip
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            You could have saved {gbp(s.couldHaveSaved)} by choosing the equivalent products we found.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-700">
            <span>
              About <strong className="text-lg text-pink-700">{gbp(s.yearlyEstimate)}</strong> a year
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500">estimate</span>
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
            If you shop like this
            <input
              type="number"
              min={1}
              max={365}
              inputMode="numeric"
              aria-label="Trips per year"
              className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm"
              value={tripsPerYear}
              onChange={(e) => onTripsChange(Math.min(365, Math.max(1, Math.floor(Number(e.target.value) || 1))))}
            />
            times a year
          </label>
          <p className="mt-2 text-xs text-gray-500">
            Based on {s.itemsWithGap} of {s.itemsChecked} checked items where an equivalent costs less per unit. Gaps
            can also reflect pack size or formulation, so treat this as a guide.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-green-50 p-5">
          <h2 className="text-xl font-extrabold text-green-700">No Pink Tax found on this receipt</h2>
          <p className="mt-1 text-sm text-gray-700">
            {s.itemsChecked > 0
              ? `We checked ${s.itemsChecked} item${s.itemsChecked > 1 ? 's' : ''} and found no cheaper equivalent per unit.`
              : 'We couldn’t compare any of the items you ticked. Try different items or fix the names.'}
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {ranked.map(({ r, tax }) => (
          <li key={r.row.id} className="rounded-2xl border border-gray-200 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold">{r.row.name}</span>
              <span className={`text-sm font-bold ${tax > 0 ? 'text-pink-700' : 'text-gray-500'}`}>
                {tax > 0 ? `${gbp(tax)} extra` : 'no gap'}
              </span>
            </div>
            <details className="mt-2">
              <summary className="min-h-11 cursor-pointer py-2 text-sm text-pink-700">See comparison</summary>
              <ResultCard comparison={r.comparison!} compact />
            </details>
            <CallItOut comparison={r.comparison!} />
          </li>
        ))}
      </ul>

      {failed.length > 0 && (
        <ul className="space-y-1 text-sm text-gray-600">
          {failed.map((r) => (
            <li key={r.row.id}>{r.row.name}: couldn’t compare (left out of the total)</li>
          ))}
        </ul>
      )}
    </section>
  );
}
