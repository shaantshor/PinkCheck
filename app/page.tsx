'use client';
import { useEffect, useRef, useState } from 'react';
import demo from '@/data/demo.json';
import type { Comparison } from '@/lib/types';
import ResultCard from '@/components/ResultCard';
import Loading from '@/components/Loading';
import IntroSplash from '@/components/IntroSplash';

const chips: string[] = (demo as { products: { name: string }[] }[])
  .map((pair) => pair.products[0]?.name)
  .filter(Boolean)
  .slice(0, 6);

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Comparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  async function run(name: string) {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: { name: name.trim() } }),
      });
      if (!res.ok) throw new Error('bad response');
      setResult(await res.json());
    } catch {
      setError("Something went wrong. Check your connection and try again, or try a different product name.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 p-4">
      <IntroSplash />
      <header className="anim-fade-up rounded-3xl bg-gradient-to-br from-pink-100 via-pink-50 to-white p-5">
        <h1 className="text-2xl font-extrabold text-pink-600">PinkCheck</h1>
        <p className="mt-1 text-base font-semibold text-gray-900">Am I paying a Pink Tax?</p>
        <p className="mt-1 text-sm text-gray-600">
          Search a product to see the price per unit against a like for like swap.
        </p>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Gillette Venus razor"
          className="min-h-12 flex-1 rounded-xl border border-gray-300 px-3 text-base focus:border-pink-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="press min-h-12 rounded-xl bg-pink-600 px-4 font-semibold text-white disabled:opacity-50"
        >
          Check
        </button>
      </form>

      {chips.length > 0 && !result && !loading && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Try one</p>
          <div className="flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <button
              key={c}
              style={{ animationDelay: `${0.15 + i * 0.07}s` }}
              onClick={() => {
                setQ(c);
                run(c);
              }}
              className="anim-pop press rounded-full bg-pink-50 px-3 py-2 text-sm text-pink-700"
            >
              {c}
            </button>
          ))}
          </div>
          <p className="text-xs text-gray-500">Prices read from Superdrug product pages on 11 Nov 2026.</p>
        </div>
      )}

      {loading && <Loading />}
      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {result && (
        <div ref={resultRef} className="scroll-mt-4 space-y-4">
          <ResultCard comparison={result} />
          <button
            onClick={() => {
              setResult(null);
              setQ('');
            }}
            className="press min-h-12 w-full rounded-xl border border-pink-200 text-pink-700"
          >
            Check another product
          </button>
        </div>
      )}
    </div>
  );
}
