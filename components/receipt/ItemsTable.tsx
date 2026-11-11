'use client';

import { hasMismatch, itemsSum } from '@/lib/receipt/totals';
import { MAX_CHECK, parsePrice, type ReceiptRow } from '@/lib/receipt/rows';

type Props = {
  rows: ReceiptRow[];
  store: string | null;
  receiptTotal: number | null;
  sample: boolean;
  onChange: (rows: ReceiptRow[]) => void;
};

export default function ItemsTable({ rows, store, receiptTotal, sample, onChange }: Props) {
  const tickedCount = rows.filter((r) => r.ticked).length;
  const mismatch = hasMismatch(rows, receiptTotal);
  const update = (id: string, patch: Partial<ReceiptRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <section aria-label="Items read from your receipt" className="space-y-3">
      {sample && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Sample receipt</p>
      )}
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-gray-900">{store ? `${store} receipt` : 'Your receipt'}</h2>
        {receiptTotal != null && <span className="text-sm text-gray-600">Total £{receiptTotal.toFixed(2)}</span>}
      </div>
      {mismatch && (
        <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Some items may be misread, please check
          <span className="block text-xs text-amber-800">
            Items add up to £{itemsSum(rows).toFixed(2)}, receipt says £{receiptTotal!.toFixed(2)}.
          </span>
        </p>
      )}
      <p className="text-xs text-gray-500">
        Tick up to {MAX_CHECK} items to check. Prices are copied from your receipt; fix anything we misread.
      </p>

      <ul className="space-y-2">
        {rows.map((r) => {
          const needsPrice = r.line_total == null;
          const blocked = !r.ticked && (tickedCount >= MAX_CHECK || needsPrice);
          return (
            <li
              key={r.id}
              className={`rounded-xl border p-3 ${needsPrice ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  aria-label={`Check ${r.name || r.raw_text} for Pink Tax`}
                  className="mt-1 h-6 w-6 shrink-0 accent-pink-600"
                  checked={r.ticked}
                  disabled={blocked}
                  onChange={(e) => update(r.id, { ticked: e.target.checked })}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    type="text"
                    aria-label="Product name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={r.name}
                    onChange={(e) => update(r.id, { name: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-gray-600">
                      Qty
                      <input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        className="w-14 rounded-lg border border-gray-300 px-2 py-2 text-sm"
                        value={r.qty}
                        onChange={(e) => update(r.id, { qty: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                      />
                    </label>
                    <label className="flex flex-1 items-center gap-1 text-xs text-gray-600">
                      £
                      <input
                        type="text"
                        inputMode="decimal"
                        aria-label="Line price in pounds"
                        placeholder={needsPrice ? 'Enter price' : ''}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={r.priceText}
                        onChange={(e) => {
                          const v = parsePrice(e.target.value);
                          update(r.id, {
                            priceText: e.target.value,
                            line_total: v,
                            unreadable: v == null,
                            ticked: v == null ? false : r.ticked,
                          });
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {needsPrice ? (
                      <span className="font-semibold text-amber-800">We couldn&apos;t read this line. Please fill in the price. </span>
                    ) : (
                      <span>from your receipt · </span>
                    )}
                    <span className="font-mono">{r.raw_text}</span>
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {tickedCount >= MAX_CHECK && <p className="text-xs text-gray-500">That&apos;s the maximum of {MAX_CHECK} items.</p>}
    </section>
  );
}
