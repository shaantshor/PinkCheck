import type { Comparison, Product } from '@/lib/types';
import { unitPrice } from '@/lib/score';
import ScoreGauge from './ScoreGauge';

// Stable props: { comparison, compact? }. Device B imports this. Do not change the props.

function unitLabel(p: Product) {
  const u = unitPrice(p);
  if (u === null || !p.unit) return null;
  // ml and g are shown per 100 so the number is readable; razors and items per item.
  if (p.unit === 'ml' || p.unit === 'g') return { big: '£' + (u * 100).toFixed(2), per: `per 100 ${p.unit}` };
  const per = p.unit === 'item' ? 'item' : p.unit;
  return { big: u < 1 ? (u * 100).toFixed(1) + 'p' : '£' + u.toFixed(2), per: `per ${per}` };
}

function SourceLine({ p }: { p: Product }) {
  if (p.price_gbp == null) return <span className="text-xs text-gray-500">price not found</span>;
  const date = p.checked_on ? ` · checked ${p.checked_on}` : '';
  if (p.source === 'photo' || p.source === 'receipt') {
    return (
      <span className="text-xs text-gray-500">
        from your {p.source === 'photo' ? 'photo' : 'receipt'}
        {date}
      </span>
    );
  }
  if (p.source_url) {
    return (
      <span className="text-xs text-gray-500">
        <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">
          source
        </a>
        {date}
      </span>
    );
  }
  return <span className="text-xs text-gray-500">source not available{date}</span>;
}

function Side({ p, title, strong }: { p: Product; title: string; strong?: boolean }) {
  const ul = unitLabel(p);
  return (
    <div className={`flex-1 rounded-xl p-3 ${strong ? 'bg-green-50' : 'bg-gray-50'}`}>
      <div className="text-xs font-medium uppercase text-gray-500">{title}</div>
      <div className="mt-1 text-sm font-semibold leading-tight">{p.name}</div>
      <div className="text-xs text-gray-500">{[p.brand, p.retailer].filter(Boolean).join(' · ')}</div>
      {ul ? (
        <div className="mt-2">
          <span className="text-3xl font-extrabold text-gray-900">{ul.big}</span>
          <div className="text-sm font-medium text-gray-600">{ul.per}</div>
        </div>
      ) : (
        <div className="mt-2 text-lg font-bold text-gray-500">price not found</div>
      )}
      <div className="text-xs text-gray-600">
        {p.price_gbp != null ? `£${p.price_gbp.toFixed(2)}` : ''}
        {p.quantity != null && p.unit ? ` · ${p.quantity} ${p.unit}` : ''}
      </div>
      <div className="mt-1">
        <SourceLine p={p} />
      </div>
    </div>
  );
}

export default function ResultCard({
  comparison,
  compact = false,
}: {
  comparison: Comparison;
  compact?: boolean;
}) {
  const { target, best, alternatives, label, score, explanation, live, savings_per_pack } = comparison;
  const more = alternatives.filter((a) => a !== best).slice(0, 2);

  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
      <ScoreGauge score={score} label={label} />

      {label === 'Reverse gap' && (
        <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
          Good news: the women&apos;s version is cheaper here
        </p>
      )}
      {label === 'Not enough data' && (
        <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
          We couldn&apos;t find enough data for a fair comparison. Try typing the product name instead.
        </p>
      )}

      {best && label !== 'Not enough data' && (
        <div className="mt-3 flex gap-2">
          <Side p={target} title="Your product" />
          <Side p={best} title="Equivalent" strong />
        </div>
      )}

      {savings_per_pack !== null && savings_per_pack > 0 && (
        <p className="mt-3 inline-block rounded-full bg-pink-100 px-3 py-1 text-sm font-bold text-pink-700">
          You could save about £{savings_per_pack.toFixed(2)} per pack
        </p>
      )}

      {comparison.equivalence_reasons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {comparison.equivalence_reasons.map((r) => (
            <span key={r} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
              {r}
            </span>
          ))}
        </div>
      )}

      {!compact && explanation && <p className="mt-3 text-sm text-gray-700">{explanation}</p>}

      {!compact && more.length > 0 && (
        <div className="-mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
          {more.map((a) => (
            <div key={a.name + (a.retailer ?? '')} className="w-64 shrink-0 snap-start">
              <Side p={a} title="Also consider" />
            </div>
          ))}
        </div>
      )}

      {live && (
        <span className="mt-3 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
          Live estimate, check source
        </span>
      )}
    </div>
  );
}
