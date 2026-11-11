'use client';
import { useEffect, useRef, useState } from 'react';
import type { Comparison, Product } from '@/lib/types';
import { fileOrCanvasToJpegBase64 } from '@/lib/image';
import ResultCard from '@/components/ResultCard';
import Loading from '@/components/Loading';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOk, setCamOk] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<Comparison | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function identify(b64: string) {
    setBusy('Reading the product…');
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: b64 }),
      });
      const data = await res.json();
      if (data.error || !data.product) {
        setError(String(data.error ?? "We couldn't read that.").includes('Search tab') ? data.error : `${data.error ?? "We couldn't read that."} Try another photo, or type the product name on the Search tab.`);
        setProduct(null);
      } else {
        setProduct(data.product);
        setText([data.product.name, data.product.quantity && data.product.unit ? `${data.product.quantity} ${data.product.unit}` : ''].filter(Boolean).join(' '));
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

  async function findCheaper() {
    if (!product) return;
    setBusy('Finding cheaper equivalents…');
    setError(null);
    try {
      // The edited text becomes the name; keep shelf-label price and size only if the name is unchanged.
      const unchanged = text.trim() === [product.name, product.quantity && product.unit ? `${product.quantity} ${product.unit}` : ''].filter(Boolean).join(' ');
      const p: Product = unchanged ? product : { name: text.trim(), source: undefined };
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

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-extrabold text-pink-600">Scan</h1>

      {camOk && (
        <div className="space-y-3">
          <video ref={videoRef} playsInline muted autoPlay className="aspect-[3/4] w-full rounded-2xl bg-black object-cover" />
          <button onClick={capture} disabled={!!busy} className="min-h-14 w-full rounded-2xl bg-pink-600 text-lg font-bold text-white disabled:opacity-50">
            Capture
          </button>
        </div>
      )}

      <label className="block min-h-12 cursor-pointer rounded-2xl border-2 border-dashed border-pink-300 p-4 text-center text-pink-700">
        {camOk ? 'Or choose a photo' : 'Take or choose a photo of the product'}
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>

      {busy && <Loading text={busy} />}
      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {product && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">We think this is:</label>
          <input value={text} onChange={(e) => setText(e.target.value)} className="min-h-12 w-full rounded-xl border border-gray-300 px-3 text-base" />
          {product.price_gbp != null && <p className="text-xs text-gray-500">Shelf price £{product.price_gbp.toFixed(2)} read from your photo</p>}
          <button onClick={findCheaper} disabled={!!busy || !text.trim()} className="min-h-12 w-full rounded-xl bg-pink-600 font-semibold text-white disabled:opacity-50">
            Find cheaper alternatives
          </button>
        </div>
      )}

      {result && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold">Cheaper alternatives</h2>
          <ResultCard comparison={result} />
        </section>
      )}
    </div>
  );
}
