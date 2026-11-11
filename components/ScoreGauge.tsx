'use client';
import { useEffect, useState } from 'react';
import type { Comparison } from '@/lib/types';

export function toneFor(label: Comparison['label']) {
  switch (label) {
    case 'High':
      return { text: 'text-rose-600', bg: 'bg-rose-50', stroke: '#e11d48' };
    case 'Moderate':
      return { text: 'text-amber-600', bg: 'bg-amber-50', stroke: '#d97706' };
    case 'Not enough data':
      return { text: 'text-gray-500', bg: 'bg-gray-50', stroke: '#9ca3af' };
    default:
      return { text: 'text-green-600', bg: 'bg-green-50', stroke: '#16a34a' };
  }
}

export default function ScoreGauge({ score, label }: { score: number | null; label: Comparison['label'] }) {
  const tone = toneFor(label);
  const r = 34;
  const c = 2 * Math.PI * r;
  const target = score ?? 0;
  const [shown, setShown] = useState(0);

  // Count up and fill the ring on mount. Respects reduced motion.
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setShown(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <div className="flex items-center gap-3">
      <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden>
        <circle cx="42" cy="42" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke={tone.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(shown / 100) * c} ${c}`}
          transform="rotate(-90 42 42)"
        />
        <text x="42" y="48" textAnchor="middle" className="fill-gray-800" fontSize="22" fontWeight="700">
          {score === null ? '–' : shown}
        </text>
      </svg>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500">Pink Tax Score</div>
        <div className={`anim-pop text-xl font-bold ${tone.text}`} style={{ animationDelay: '0.3s' }}>
          {label}
        </div>
        <span className="sr-only">Score {score ?? 'not available'} out of 100</span>
      </div>
    </div>
  );
}
