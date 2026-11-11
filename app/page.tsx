'use client';
import { useState } from 'react';
import demo from '@/data/demo.json';
import type { Comparison } from '@/lib/types';
import ResultCard from '@/components/ResultCard';
import Loading from '@/components/Loading';

const chips: string[] = (demo as { products: { name: string }[] }[])
  .flatMap((pair) => pair.products.map((p) => p.name))
  .filter(Boolean)
  .slice(0, 6);

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Comparison | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <header>
        <h1 className="text-2xl font-extrabold text-pink-600">PinkCheck</h1>
        <p className="text-sm text-gray-600">Find out if you may be paying more, and what to buy instead.</p>
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
          className="min-h-12 rounded-xl bg-pink-600 px-4 font-semibold text-white disabled:opacity-50"
        >
          Check
        </button>
      </form>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => {
                setQ(c);
                run(c);
              }}
              className="rounded-full bg-pink-50 px-3 py-2 text-sm text-pink-700"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading && <Loading />}
      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {result && <ResultCard comparison={result} />}
    </div>
  );
}
