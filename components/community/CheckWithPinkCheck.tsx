'use client';
import { useRef, useState } from 'react';
import ResultCard from '@/components/ResultCard';
import type { Comparison } from '@/lib/types';

const TIMEOUT_MS = 50_000;

type State =
  | { s: 'idle' }
  | { s: 'loading' }
  | { s: 'done'; c: Comparison }
  | { s: 'error'; msg: string };

/** The hook of the Community tab: runs the same engine as Search on the post's product name. */
export default function CheckWithPinkCheck({ productName }: { productName: string }) {
  const [state, setState] = useState<State>({ s: 'idle' });
  const run = useRef(0);

  const check = async () => {
    const id = ++run.current;
    setState({ s: 'loading' });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: { name: productName } }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`compare ${res.status}`);
      const c = (await res.json()) as Comparison;
      if (!c || typeof c.label !== 'string' || !c.target) throw new Error('bad response');
      if (id === run.current) setState({ s: 'done', c });
    } catch {
      if (id === run.current)
        setState({
          s: 'error',
          msg: "We couldn't run the check just now. Check your connection and try again, or search for the product on the Search tab.",
        });
    } finally {
      clearTimeout(timer);
    }
  };

  return (
    <section className="mt-4" aria-label="Check this with PinkCheck">
      {state.s !== 'done' && (
        <div className="anim-fade-up rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 p-4 text-white shadow-md">
          <p className="text-sm font-medium text-pink-100">Product in this post</p>
          <p className="break-words text-base font-bold leading-snug">{productName}</p>
          <button
            type="button"
            onClick={check}
            disabled={state.s === 'loading'}
            className="press mt-3 min-h-12 w-full rounded-full bg-white px-4 text-base font-extrabold text-pink-700 shadow-sm disabled:opacity-80"
          >
            {state.s === 'loading' ? 'Finding cheaper equivalents...' : 'Check this with PinkCheck'}
          </button>
          {state.s === 'loading' && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/30" aria-hidden="true">
              <div className="h-full w-2/3 animate-pulse motion-reduce:animate-none rounded-full bg-white" />
            </div>
          )}
          <p className="mt-2 text-xs text-pink-100" aria-live="polite">
            {state.s === 'loading'
              ? 'Instant for products in our demo set; live searches can take 10 to 20 seconds.'
              : 'Compares price per unit with similar products, with sources.'}
          </p>
        </div>
      )}

      {state.s === 'error' && (
        <div role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {state.msg}
          <button
            type="button"
            onClick={check}
            className="press ml-2 mt-2 min-h-11 rounded-full bg-white px-4 text-sm font-bold text-pink-700"
          >
            Try again
          </button>
        </div>
      )}

      {state.s === 'done' && (
        <div className="space-y-3">
          <p className="anim-fade-up text-sm font-semibold text-gray-900">PinkCheck result for this post</p>
          <ResultCard comparison={state.c} />
          <button
            type="button"
            onClick={() => setState({ s: 'idle' })}
            className="press min-h-11 rounded-full bg-gray-100 px-4 text-sm font-medium text-gray-700"
          >
            Hide result
          </button>
        </div>
      )}
    </section>
  );
}
