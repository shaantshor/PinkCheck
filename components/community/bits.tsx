'use client';
import { useEffect, useState } from 'react';
import { timeAgo } from '@/lib/community/sanitize';
import { POST_TYPES, type PostPrice, type PostType } from '@/lib/community/types';

const TYPE_STYLE: Record<PostType, string> = {
  question: 'bg-amber-50 text-amber-800',
  swap: 'bg-green-50 text-green-700',
  discussion: 'bg-pink-50 text-pink-700',
};

export function TypeTag({ type }: { type: PostType }) {
  const t = POST_TYPES.find((p) => p.id === type);
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_STYLE[type]}`}>{t?.short ?? type}</span>
  );
}

export function ExampleTag() {
  return (
    <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-500">
      Example post
    </span>
  );
}

/** Re-renders once a minute so "time ago" stays fresh. Renders nothing until mounted (no hydration mismatch). */
export function TimeAgo({ iso }: { iso: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return <span>{now === null ? '' : timeAgo(iso, now)}</span>;
}

/** The only place a price is rendered: always with its source link and date. */
export function PriceLine({ price, product }: { price: PostPrice; product?: string }) {
  return (
    <p className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700">
      {product && <span className="font-medium">{product}: </span>}
      <span className="font-bold text-gray-900">£{price.price_gbp.toFixed(2)}</span>
      {price.retailer ? ` at ${price.retailer}` : ''}
      {' · '}
      <a
        href={price.source_url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-pink-600 underline"
        onClick={(e) => e.stopPropagation()}
      >
        source
      </a>
      {price.checked_on ? ` · checked ${price.checked_on}` : ' · shared by the poster, check the source'}
    </p>
  );
}

export function UpArrow({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M10 3 L17 11 H12.5 V17 H7.5 V11 H3 Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CommentIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M4 4h12a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 16 14H9l-4 3v-3H4a1.5 1.5 0 0 1-1.5-1.5v-7A1.5 1.5 0 0 1 4 4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VoteButton({
  voted,
  count,
  onVote,
  label,
}: {
  voted: boolean;
  count: number;
  onVote: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onVote();
      }}
      aria-pressed={voted}
      aria-label={voted ? `Remove your upvote from ${label}` : `Upvote ${label}`}
      className={`press inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ${
        voted ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-700'
      }`}
    >
      <UpArrow filled={voted} />
      <span className={voted ? 'anim-pop' : ''} key={count}>
        {count}
      </span>
    </button>
  );
}
