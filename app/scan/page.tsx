'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import demo from '@/data/demo.json';
import type { Comparison, Product } from '@/lib/types';
import { fileOrCanvasToJpegBase64 } from '@/lib/image';
import ResultCard from '@/components/ResultCard';
import CallItOut from '@/components/extras/CallItOut';
import Loading from '@/components/Loading';

const SAMPLE_NAME: string =
  (demo as { products: { name: string }[] }[]).map((p) => p.products[0]?.name).find(Boolean) ?? '';

const sizeText = (p: Product) => (p.quantity && p.unit ? `${p.quantity} ${p.unit}` : '');
const describe = (p: Product) => [p.name, sizeText(p)].filter(Boolean).join(' ');

function Corners() {
  const c = 'absolute h-9 w-9 border-pink-500';
  return (
    <>
      <span className={`${c} left-4 top-4 rounded-tl-2xl border-l-4 border-t-4`} />
      <span className={`${c} right-4 top-4 rounded-tr-2xl border-r-4 border-t-4`} />
      <span className={`${c} bottom-4 left-4 rounded-bl-2xl border-b-4 border-l-4`} />
      <span className={`${c} bottom-4 right-4 rounded-br-2xl border-b-4 border-r-4`} />
    </>
  );
}

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOk, setCamOk] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState<Comparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCamOk(true);
      } catch {
        setCamOk(false); // permission denied or unsupported: file input fallback stays visible
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // When the camera becomes available, attach the stream (the <video> mounts after camOk flips).
  useEffect(() => {
    if (camOk && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [camOk]);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  function reset() {
    setProduct(null);
    setIsSample(false);
    setText('');
    setResult(null);
    setError(null);
  }

  async function identify(b64: string) {
    reset();
    setBusy('Reading the product…');
    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: b64 }),
      });
      const data = await res.json();
      if (data.error || !data.product) {
        const msg = String(data.error ?? "We couldn't read that.");
        setError(msg.includes('Search tab') ? msg : `${msg} Try another photo, or type the product name on the Search tab.`);
      } else {
        setProduct(data.product);
        setText(describe(data.product));
      }
    } catch {
      setError('Something went wrong. Try again, or type the product name on the Search tab.');
    } finally {
      setBusy(null);
    }
  }

  async function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    await identify(await fileOrCanvasToJpegBase64(c, 1000));
  }

  async function onFile(f?: File | null) {
    if (!f) return;
    try {
      await identify(await fileOrCanvasToJpegBase64(f, 1000));
    } catch {
      setError("We couldn't open that photo. Try another, or type the product name on the Search tab.");
    }
  }

  function trySample() {
    reset();
    if (!SAMPLE_NAME) return;
    const p: Product = { name: SAMPLE_NAME };
    setProduct(p);
    setIsSample(true);
    setText(SAMPLE_NAME);
  }

  async function findCheaper() {
    if (!product) return;
    setBusy('Finding cheaper equivalents…');
    setError(null);
    try {
      // Keep the photo's shelf price and size only if the user did not edit the text.
      const unchanged = text.trim() === describe(product);
      const p: Product = unchanged ? product : { name: text.trim() };
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: p }),
      });
      setResult(await res.json());
    } catch {
      setError('Something went wrong. Try again, or type the product name on the Search tab.');
    } finally {
      setBusy(null);
    }
  }

  const fileInput = (
    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
  );

  return (
    <div className="space-y-4 p-4">
      <header className="anim-fade-up rounded-3xl bg-gradient-to-br from-pink-100 via-pink-50 to-white p-5">
        <h1 className="text-2xl font-extrabold text-pink-600">Scan</h1>
        <p className="mt-1 text-sm text-gray-600">Photograph a product in the aisle and see cheaper alternatives.</p>
      </header>

      {!result && camOk && (
        <div className="anim-fade-up space-y-3">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-black shadow-lg">
            <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0">
              <Corners />
              {!busy && <span className="anim-scan absolute inset-x-6 h-0.5 rounded-full bg-pink-400/80 shadow-[0_0_14px_3px_rgba(244,114,182,0.7)]" />}
              <span className="absolute inset-x-0 bottom-5 text-center text-xs font-medium text-white/90 drop-shadow">
                Fit the front of the product in the frame
              </span>
            </div>
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                <Loading text={busy} />
              </div>
            )}
          </div>
          <button
            onClick={capture}
            disabled={!!busy}
            className="press anim-pulse-ring min-h-14 w-full rounded-2xl bg-pink-600 text-lg font-bold text-white shadow-lg disabled:opacity-50"
          >
            Capture
          </button>
        </div>
      )}

      {!result && !camOk && !product && (
        <div className="anim-fade-up rounded-3xl border border-pink-100 bg-white p-5 text-center shadow-sm">
          <div className="anim-float mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-pink-50 text-4xl">📷</div>
          <h2 className="mt-3 text-lg font-bold text-gray-900">Photograph a product</h2>
          <ul className="mx-auto mt-2 max-w-xs space-y-1 text-left text-sm text-gray-600">
            <li>• Fill the frame with the front of the pack</li>
            <li>• Include the shelf label if you can, so we can read the price</li>
            <li>• Good light helps</li>
          </ul>
          <label className="press mt-4 block min-h-14 cursor-pointer rounded-2xl bg-pink-600 px-4 py-4 text-lg font-bold text-white shadow-lg">
            Take or choose a photo
            {fileInput}
          </label>
        </div>
      )}

      {!result && camOk && (
        <label className="press block min-h-12 cursor-pointer rounded-2xl border-2 border-dashed border-pink-300 p-3 text-center text-sm text-pink-700">
          Or choose a photo from your phone
          {fileInput}
        </label>
      )}

      {!result && !busy && !product && SAMPLE_NAME && (
        <button onClick={trySample} className="press min-h-12 w-full rounded-2xl bg-pink-50 text-sm font-semibold text-pink-700">
          No product to hand? Try a sample
        </button>
      )}

      {!camOk && busy && <Loading text={busy} />}
      {error && (
        <div className="anim-fade-up space-y-2 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
          <p>{error}</p>
          <Link href="/" className="inline-block font-semibold underline">
            Go to Search
          </Link>
        </div>
      )}

      {product && !result && (
        <div className="anim-fade-up space-y-2 rounded-3xl border border-pink-100 bg-white p-4 shadow-sm">
          {isSample && (
            <p className="rounded-xl bg-amber-50 p-2 text-xs font-medium text-amber-800">
              Sample product. This was not read from a photo.
            </p>
          )}
          <label className="text-sm font-medium text-gray-700">We think this is:</label>
          <input value={text} onChange={(e) => setText(e.target.value)} className="min-h-12 w-full rounded-xl border border-gray-300 px-3 text-base focus:border-pink-500 focus:outline-none" />
          {product.price_gbp != null && (
            <p className="text-xs text-gray-500">Shelf price £{product.price_gbp.toFixed(2)} read from your photo</p>
          )}
          <button
            onClick={findCheaper}
            disabled={!!busy || !text.trim()}
            className="press min-h-12 w-full rounded-xl bg-pink-600 font-semibold text-white disabled:opacity-50"
          >
            {busy ? busy : 'Find cheaper alternatives'}
          </button>
          <button onClick={reset} className="press min-h-10 w-full text-sm text-gray-500">
            Start again
          </button>
        </div>
      )}

      {result && (
        <section ref={resultRef} className="scroll-mt-4 space-y-3">
          <h2 className="anim-fade-up text-xl font-extrabold text-gray-900">Cheaper alternatives</h2>
          {isSample && <p className="text-xs text-amber-700">Sample product, not read from a photo.</p>}
          <ResultCard comparison={result} />
          {result.label === 'High' && <CallItOut comparison={result} />}
          <button onClick={reset} className="press min-h-12 w-full rounded-xl border border-pink-200 text-pink-700">
            Scan another product
          </button>
        </section>
      )}
    </div>
  );
}
