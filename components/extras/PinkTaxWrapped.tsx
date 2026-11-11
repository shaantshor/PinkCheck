'use client';

import { useState } from 'react';
import { copyText, useCanShare } from './clipboard';

export default function PinkTaxWrapped({ total, yearly }: { total: number; yearly: number }) {
  const shareable = useCanShare();
  const [copied, setCopied] = useState(false);
  if (!(total > 0)) return null;

  const text = `This trip: £${total.toFixed(2)} Pink Tax · About £${yearly.toFixed(2)} a year (estimate) · Checked with PinkCheck`;

  return (
    <section aria-label="Pink Tax Wrapped" className="space-y-3">
      <div className="rounded-3xl bg-gradient-to-br from-pink-500 to-fuchsia-600 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-pink-100">Pink Tax Wrapped</p>
        <p className="mt-4 text-sm text-pink-100">This trip</p>
        <p className="text-5xl font-extrabold">£{total.toFixed(2)}</p>
        <p className="text-sm text-pink-100">in Pink Tax</p>
        <p className="mt-4 text-sm text-pink-100">About</p>
        <p className="text-3xl font-extrabold">£{yearly.toFixed(2)} a year</p>
        <p className="mt-6 text-xs font-semibold text-pink-100">Checked with PinkCheck</p>
      </div>
      <button
        type="button"
        className="min-h-11 w-full rounded-xl bg-pink-600 px-4 text-sm font-semibold text-white"
        onClick={async () => {
          if (shareable) {
            try {
              await navigator.share({ text });
              return;
            } catch {
              /* cancelled or failed: fall through to copy */
            }
          }
          setCopied(await copyText(text));
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? 'Copied to clipboard' : 'Share my result'}
      </button>
    </section>
  );
}
