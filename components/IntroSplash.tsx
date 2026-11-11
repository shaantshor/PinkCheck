'use client';
import { useEffect, useState } from 'react';

const KEY = 'pinkcheck-intro-seen';

function useCountUp(target: number, ms = 1400, start = true) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, start]);
  return n;
}

const STEPS = [
  { icon: '🔍', title: 'Search or scan', text: 'Type a product, or snap it on the shelf.' },
  { icon: '⚖️', title: 'Compare per unit', text: 'We find a like for like swap and check the price per unit.' },
  { icon: '💷', title: 'See what you could save', text: 'A clear score, with a source for every price.' },
];

export default function IntroSplash() {
  // null = not decided yet (avoids a flash on first paint)
  const [show, setShow] = useState<boolean | null>(null);
  const [leaving, setLeaving] = useState(false);
  const pct = useCountUp(13, 1400, show === true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === '1';
    } catch {
      /* storage blocked: just show it */
    }
    setShow(!seen);
  }, []);

  function enter() {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    setLeaving(true);
    setTimeout(() => setShow(false), 450);
  }

  if (show !== true) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col overflow-hidden bg-gradient-to-b from-pink-100 via-white to-pink-50 ${
        leaving ? 'anim-splash-out' : ''
      }`}
    >
      <div className="anim-drift pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="anim-drift pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl [animation-delay:-4s]" />

      <div className="relative mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-6 pb-6 pt-10">
        <div className="min-h-0 flex-1 overflow-y-auto pb-2">
          <div className="anim-fade-up flex items-center gap-2" style={{ animationDelay: '0.05s' }}>
            <span className="anim-float inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-600 text-xl text-white shadow-lg">
              ✓
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-pink-600">PinkCheck</span>
          </div>

          <h1 className="anim-fade-up mt-6 text-4xl font-extrabold leading-tight text-gray-900" style={{ animationDelay: '0.2s' }}>
            Are you paying a <span className="text-pink-600">Pink Tax</span>?
          </h1>
          <p className="anim-fade-up mt-3 text-base text-gray-600" style={{ animationDelay: '0.35s' }}>
            Some products cost more just because they are marketed to women. PinkCheck compares like for like, so you can see
            when you may be paying more.
          </p>

          <div
            className="anim-pop mt-6 inline-flex items-baseline gap-2 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-pink-100"
            style={{ animationDelay: '0.5s' }}
          >
            <span className="text-5xl font-extrabold tabular-nums text-rose-600">{pct}%</span>
            <span className="max-w-[11rem] text-sm leading-snug text-gray-600">
              more for women&apos;s personal care in a 2015 New York study
            </span>
          </div>

          <ul className="mt-5 space-y-2">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="anim-fade-up flex items-start gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-pink-100"
                style={{ animationDelay: `${0.7 + i * 0.15}s` }}
              >
                <span className="text-2xl">{s.icon}</span>
                <span>
                  <span className="block text-sm font-bold text-gray-900">{s.title}</span>
                  <span className="block text-sm text-gray-600">{s.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="anim-fade-up mt-3 shrink-0" style={{ animationDelay: '1.2s' }}>
          <button
            onClick={enter}
            className="anim-pulse-ring press min-h-14 w-full rounded-2xl bg-pink-600 text-lg font-bold text-white shadow-lg"
          >
            Get started
          </button>
          <p className="mt-3 text-center text-xs text-gray-500">Every price shows its source. No sign up.</p>
        </div>
      </div>
    </div>
  );
}
