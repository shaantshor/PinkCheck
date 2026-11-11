import type { Comparison } from '@/lib/types';

// Stable props: { comparison, compact? }. Device B imports this. Polished in story A-2.
export default function ResultCard({
  comparison,
  compact = false,
}: {
  comparison: Comparison;
  compact?: boolean;
}) {
  const { target, best, label, score, explanation, live, savings_per_pack } = comparison;
  const tone =
    label === 'High'
      ? 'text-rose-600'
      : label === 'Moderate'
        ? 'text-amber-600'
        : 'text-green-600';
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between">
        <span className={`text-lg font-semibold ${tone}`}>{label}</span>
        {score !== null && <span className="text-2xl font-bold text-gray-800">{score}</span>}
      </div>
      <p className="mt-1 text-sm text-gray-700">
        {target.name}
        {best ? ` vs ${best.name}` : ''}
      </p>
      {savings_per_pack !== null && savings_per_pack > 0 && (
        <p className="mt-1 text-sm font-medium text-pink-600">
          You could save about £{savings_per_pack.toFixed(2)} per pack
        </p>
      )}
      {!compact && <p className="mt-2 text-sm text-gray-600">{explanation}</p>}
      {live && (
        <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
          Live estimate, check source
        </span>
      )}
    </div>
  );
}
