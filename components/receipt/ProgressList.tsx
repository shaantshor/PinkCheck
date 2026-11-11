import type { CheckResult } from '@/lib/receipt/compareClient';

export default function ProgressList({ results }: { results: CheckResult[] }) {
  return (
    <ul className="space-y-2" aria-live="polite">
      {results.map((r) => (
        <li key={r.row.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm">
          {r.status === 'checking' && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-pink-200 border-t-pink-600" aria-hidden />
          )}
          {r.status === 'done' && <span className="font-bold text-green-600">✓</span>}
          {r.status === 'failed' && <span className="font-bold text-gray-500">–</span>}
          <span className="min-w-0 flex-1 truncate">
            {r.status === 'checking' && `Checking ${r.row.name}…`}
            {r.status === 'done' && `Checked ${r.row.name}`}
            {r.status === 'failed' && `${r.row.name}: couldn’t compare`}
          </span>
        </li>
      ))}
    </ul>
  );
}
