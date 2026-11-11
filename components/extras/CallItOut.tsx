'use client';

import { useState } from 'react';
import type { Comparison, Product } from '@/lib/types';
import { unitPrice } from '@/lib/score';
import { copyText, useCanShare } from './clipboard';

function unitText(p: Product): string | null {
  const u = unitPrice(p);
  if (u === null || !p.unit) return null;
  const money = u < 1 ? `${(u * 100).toFixed(1)}p` : `£${u.toFixed(2)}`;
  return `${money} per ${p.unit === 'item' ? 'item' : p.unit}`;
}

/** Template only, no LLM. Built from the Comparison's own numbers; null when we can't state both prices. */
export function buildCallItOutMessage(c: Comparison): string | null {
  if (c.label !== 'High' || !c.best) return null;
  const a = unitText(c.target);
  const b = unitText(c.best);
  if (!a || !b) return null;
  const [pa, ...ra] = a.split(' per ');
  const [pb] = b.split(' per ');
  return `Your ${c.target.name} costs ${pa} per ${ra.join(' per ')} vs ${pb} for ${c.best.name}, a functionally equivalent product. Could you explain the difference?`;
}

export default function CallItOut({ comparison }: { comparison: Comparison }) {
  const message = buildCallItOutMessage(comparison);
  const shareable = useCanShare();
  const [copied, setCopied] = useState(false);
  if (!message) return null;

  return (
    <div className="mt-3 rounded-xl border border-pink-200 bg-pink-50 p-3">
      <p className="text-sm font-semibold text-pink-800">Call it out</p>
      <p className="mt-1 text-sm text-gray-800">{message}</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="min-h-11 flex-1 rounded-xl bg-pink-600 px-3 text-sm font-semibold text-white"
          onClick={async () => {
            setCopied(await copyText(message));
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? 'Copied' : 'Copy message'}
        </button>
        {shareable && (
          <button
            type="button"
            className="min-h-11 flex-1 rounded-xl border border-pink-300 bg-white px-3 text-sm font-semibold text-pink-700"
            onClick={() => navigator.share({ text: message }).catch(() => {})}
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
}
