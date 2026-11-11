'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fileOrCanvasToJpegBase64 } from '@/lib/image';
import { compareItems, type CheckResult } from '@/lib/receipt/compareClient';
import { toRows, type ReceiptRead, type ReceiptRow } from '@/lib/receipt/rows';
import ItemsTable from '@/components/receipt/ItemsTable';
import ProgressList from '@/components/receipt/ProgressList';
import SummaryCard from '@/components/receipt/SummaryCard';
import PinkTaxWrapped from '@/components/extras/PinkTaxWrapped';
import { summarise } from '@/lib/receipt/totals';

type Stage = 'idle' | 'reading' | 'review' | 'checking' | 'done' | 'error';

const ERR = 'Try a flatter, brighter photo';
const SAMPLE_FILES = ['/sample-receipt.jpg', '/sample-receipt.jpeg', '/sample-receipt.png'];

function ReceiptFlow() {
  const sample = useSearchParams().get('sample') === '1';
  const [stage, setStage] = useState<Stage>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ReceiptRow[]>([]);
  const [store, setStore] = useState<string | null>(null);
  const [receiptTotal, setReceiptTotal] = useState<number | null>(null);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [trips, setTrips] = useState(12);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function readReceipt(file: Blob) {
    setError(null);
    setStage('reading');
    setPreview(URL.createObjectURL(file));
    try {
      const image = await fileOrCanvasToJpegBase64(file, 1500);
      const res = await fetch('/api/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || ERR);
      const read = data as ReceiptRead;
      setRows(toRows(read));
      setStore(read.store);
      setReceiptTotal(read.receipt_total);
      setStage('review');
    } catch (e) {
      setError(e instanceof Error && e.message && e.message !== 'Failed to fetch' ? e.message : ERR);
      setStage('error');
    }
  }

  async function loadSample() {
    for (const url of SAMPLE_FILES) {
      try {
        const res = await fetch(url);
        if (res.ok && (res.headers.get('content-type') ?? '').startsWith('image/')) {
          return readReceipt(await res.blob());
        }
      } catch {
        /* try next */
      }
    }
    setError('The sample receipt file is not available yet. Upload your own receipt instead.');
    setStage('error');
  }

  async function check() {
    setStage('checking');
    const out = await compareItems(rows, setResults);
    setResults(out);
    setStage('done');
  }

  const reset = () => {
    setStage('idle');
    setRows([]);
    setResults([]);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const tickedCount = rows.filter((r) => r.ticked).length;
  const summary = summarise(
    results.filter((r) => r.status === 'done').map((r) => ({ comparison: r.comparison, qty: r.row.qty })),
    trips,
  );

  return (
    <div className="space-y-5 p-4">
      <header>
        <h1 className="text-2xl font-extrabold text-gray-900">Receipt Pink Tax audit</h1>
        <p className="mt-1 text-sm text-gray-600">See what you may have paid extra on your last shop.</p>
      </header>

      {sample && stage === 'idle' && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Sample receipt</p>
      )}

      {preview && stage !== 'idle' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Your receipt" className="h-28 w-auto rounded-xl border border-gray-200 object-cover" />
      )}

      {(stage === 'idle' || stage === 'error') && (
        <div className="space-y-3">
          {stage === 'error' && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {error ?? ERR}
            </p>
          )}
          <input
            ref={inputRef}
            id="receipt-file"
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void readReceipt(f);
            }}
          />
          <label
            htmlFor="receipt-file"
            className="flex min-h-24 cursor-pointer items-center justify-center rounded-2xl bg-pink-600 px-4 text-center text-lg font-bold text-white shadow focus-within:ring-4 focus-within:ring-pink-300"
          >
            {stage === 'error' ? 'Try again with another photo' : 'Upload or photograph your receipt'}
          </label>
          {sample && (
            <button
              type="button"
              onClick={() => void loadSample()}
              className="min-h-11 w-full rounded-xl border border-pink-300 px-4 text-sm font-semibold text-pink-700"
            >
              Use the sample receipt
            </button>
          )}
          <p className="text-xs text-gray-500">
            Your photo is sent to be read and isn&apos;t stored. Nothing is saved on our side.
          </p>
        </div>
      )}

      {stage === 'reading' && (
        <p className="flex items-center gap-3 rounded-xl bg-pink-50 p-4 text-sm font-medium text-pink-800" aria-live="polite">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-pink-200 border-t-pink-600" aria-hidden />
          Reading your receipt…
        </p>
      )}

      {stage === 'review' && (
        <>
          <ItemsTable rows={rows} store={store} receiptTotal={receiptTotal} sample={sample} onChange={setRows} />
          <div className="sticky bottom-20 space-y-2 bg-white/90 py-2 backdrop-blur">
            <button
              type="button"
              disabled={tickedCount === 0}
              onClick={() => void check()}
              className="min-h-14 w-full rounded-2xl bg-pink-600 px-4 text-base font-bold text-white disabled:bg-gray-300"
            >
              Check for Pink Tax{tickedCount > 0 ? ` (${tickedCount})` : ''}
            </button>
            <button type="button" onClick={reset} className="min-h-11 w-full text-sm text-gray-600 underline">
              Start over with another receipt
            </button>
          </div>
        </>
      )}

      {stage === 'checking' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-pink-800">Finding cheaper equivalents… this can take up to 20 seconds.</p>
          <ProgressList results={results} />
        </div>
      )}

      {stage === 'done' && (
        <div className="space-y-5">
          <SummaryCard results={results} tripsPerYear={trips} onTripsChange={setTrips} />
          <PinkTaxWrapped total={summary.pinkTaxPaid} yearly={summary.yearlyEstimate} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setStage('review')} className="min-h-11 flex-1 rounded-xl border border-gray-300 text-sm font-semibold">
              Change items
            </button>
            <button type="button" onClick={reset} className="min-h-11 flex-1 rounded-xl border border-gray-300 text-sm font-semibold">
              New receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-gray-500">Loading…</p>}>
      <ReceiptFlow />
    </Suspense>
  );
}
